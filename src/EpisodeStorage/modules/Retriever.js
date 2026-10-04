/**
 * Retriever
 *
 * EpisodeStorage の retrieve 処理を分離したモジュール。
 * - messageVector(x) と rowVectors のスコア化（x は呼び出し側で事前計算）
 * - precision threshold で候補選出
 * - next row の取得
 
 計算事項
 * roleが異なっていた場合scoreにfactor.penalty.roleを加算
 
 */

export class Retriever {
  constructor({ wordEmbedding = null, textEmbedding = null, featureExtractor = null, defaultPrecision = 0 } = {}) {
    this.wordEmbedding = wordEmbedding;
    this.textEmbedding = textEmbedding;
    this.featureExtractor = featureExtractor;
    this.defaultPrecision = defaultPrecision;
  }

  retrieve({
    message,
    messageRole = null,
    messageVector = null,
    rowVectors = new Map(),
    dataRows = [],
    totalPrecision = 0,
    textIndex = 1,
    roleIndex = -1,
    rolePenalty = null,
    roleWeight = 1,
    verbose = false,
  } = {}) {
    // messageVector(x)は呼び出し側(EpisodeStorage)で履歴Attention込みに事前計算される

    const text =
      typeof message === "string" ? message : message && typeof message.text === "string" ? message.text : "";

    if (!text || !messageVector || !Object.keys(messageVector).length) {
      return {
        status: "error",
        message: "入力メッセージがベクトル化できませんでした",
      };
    }

    const rows = (Array.isArray(dataRows) ? dataRows : []).filter(
      (item) => item && !item.separator && Array.isArray(item.row),
    );

    if (!rows.length) {
      return {
        status: "error",
        message: "rowVectors が空です",
      };
    }

    const knownRoles = new Set(
      rows
        .map((item) => roleIndex >= 0 ? item.row[roleIndex] : null)
        .filter((role) => typeof role === 'string' && role.length > 0),
    );

    const scored = rows
      .map((item) => {
        const slotMatch = this.matchUnknownSlots(item.text, text);
        if (slotMatch.hasSlots && !slotMatch.captures) {
          return null;
        }

        const baseScore = this.vectorDot(messageVector, rowVectors.get(item.index) || {});
        const slotCount = Object.keys(slotMatch.captures || {}).length;
        const slotAdjustedScore = slotCount ? (baseScore + slotCount) / (1 + slotCount) : baseScore;
        const rowRole = roleIndex >= 0 ? item.row[roleIndex] : null;
        const hasComparableRoles =
          typeof messageRole === 'string' && messageRole.length > 0 &&
          typeof rowRole === 'string' && rowRole.length > 0 &&
          knownRoles.has(messageRole) && knownRoles.has(rowRole) &&
          roleWeight !== 0;
        const roleMismatch = hasComparableRoles && rowRole !== messageRole;
        const penalty = typeof rolePenalty === 'number' && Number.isFinite(rolePenalty) ? rolePenalty : 0;
        return {
          score: slotAdjustedScore + (roleMismatch ? penalty : 0),
          rowIndex: item.index,
          slotCaptures: slotMatch.captures || {},
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    const precision = totalPrecision >= 0 ? totalPrecision : this.defaultPrecision;
    const candidates = scored.filter((candidate) => {
      return candidate.score > precision && this.hasNextDataRow(candidate.rowIndex, dataRows, roleIndex);
    });

    if (!candidates.length) {
      if (verbose) {
        const viewSize = Math.min(5, scored.length);
        const ms = [];
        for (let i = 0; i < viewSize; i += 1) {
          const v = scored[i];
          ms.push(`score: ${v.score}, rowIndex: ${v.rowIndex}`);
        }
        return {
          status: "low score",
          message: ms.join("<br>"),
        };
      }
      return null;
    }

    const topCount = Math.min(4, candidates.length);
    const topCandidates = candidates.slice(0, topCount);
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const matchedRowIndex = selected.rowIndex;
    const nextRow = this.getNextDataRow(matchedRowIndex, dataRows, roleIndex);

    if (!nextRow) {
      if (verbose) {
        return {
          status: "no textRow",
          message: `matchedRowIndex=${matchedRowIndex}, topCount=${topCount}`,
        };
      }
      return null;
    }

    const responseRow = Array.isArray(nextRow) ? [...nextRow] : nextRow;
    const substitutions = this.buildWordTagSubstitutionMap(text, this.wordEmbedding);

    if (textIndex >= 0 && Array.isArray(responseRow) && typeof responseRow[textIndex] === "string") {
      responseRow[textIndex] = this.rewriteTextWithMatchedTags(
        responseRow[textIndex],
        substitutions,
        this.wordEmbedding,
      );
      responseRow[textIndex] = this.rewriteTextWithUnknownSlots(
        responseRow[textIndex],
        selected.slotCaptures,
      );
    }

    return {
      status: "ok",
      row: responseRow,
      score: selected.score,
    };
  }

  matchUnknownSlots(patternText, inputText) {
    const slotPattern = /\{UNKNOWN_(\d+)\}/g;
    const markers = [...(typeof patternText === 'string' ? patternText : '').matchAll(slotPattern)];
    if (!markers.length) {
      return { hasSlots: false, captures: {} };
    }

    if (typeof inputText !== 'string') {
      return { hasSlots: true, captures: null };
    }

    const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let pattern = '';
    let lastIndex = 0;
    const captures = {};

    for (let markerIndex = 0; markerIndex < markers.length; markerIndex += 1) {
      const marker = markers[markerIndex];
      const slotId = marker[1];
      if (Object.prototype.hasOwnProperty.call(captures, slotId)) {
        return { hasSlots: true, captures: null };
      }

      const literal = patternText.slice(lastIndex, marker.index);
      const hasFollowingLiteral = markerIndex < markers.length - 1
        ? marker.index + marker[0].length < markers[markerIndex + 1].index
        : marker.index + marker[0].length < patternText.length;
      if (markerIndex < markers.length - 1 && !hasFollowingLiteral) {
        return { hasSlots: true, captures: null };
      }

      pattern += escapeRegExp(literal);
      pattern += hasFollowingLiteral ? '([\\s\\S]+?)' : '([\\s\\S]+)';
      lastIndex = marker.index + marker[0].length;
      captures[slotId] = null;
    }

    pattern += escapeRegExp(patternText.slice(lastIndex));
    const match = new RegExp(pattern).exec(inputText);
    if (!match) {
      return { hasSlots: true, captures: null };
    }

    markers.forEach((marker, index) => {
      const capturedText = match[index + 1].trim();
      if (!capturedText) {
        captures[marker[1]] = null;
      } else {
        captures[marker[1]] = capturedText;
      }
    });

    if (Object.values(captures).some((capture) => capture === null)) {
        return { hasSlots: true, captures: null };
    }

    return { hasSlots: true, captures };
  }

  rewriteTextWithUnknownSlots(text, captures = {}) {
    if (typeof text !== 'string') {
      return text;
    }
    return text.replace(/\{UNKNOWN_(\d+)\}/g, (placeholder, slotId) => (
      Object.prototype.hasOwnProperty.call(captures, slotId) ? captures[slotId] : 'それ'
    ));
  }

  buildWordTagSubstitutionMap(text, wordEmbedding = this.wordEmbedding) {
    const substitutions = {};
    if (!text || typeof text !== "string" || !wordEmbedding?.dict) {
      return substitutions;
    }

    const surfaces = Object.keys(wordEmbedding.dict).sort((a, b) => {
      const diff = b.length - a.length;
      return diff !== 0 ? diff : a.localeCompare(b);
    });

    const used = Array(text.length).fill(false);

    for (const surface of surfaces) {
      const tag = wordEmbedding.dict[surface];
      if (!tag || typeof tag.groupId !== "number") {
        continue;
      }
      if (substitutions[tag.groupId]) {
        continue;
      }

      let startIndex = 0;
      while (startIndex < text.length) {
        const foundIndex = text.indexOf(surface, startIndex);
        if (foundIndex === -1) {
          break;
        }

        let collision = false;
        for (let i = foundIndex; i < foundIndex + surface.length; i += 1) {
          if (used[i]) {
            collision = true;
            break;
          }
        }

        if (!collision) {
          substitutions[tag.groupId] = surface;
          for (let i = foundIndex; i < foundIndex + surface.length; i += 1) {
            used[i] = true;
          }
          break;
        }

        startIndex = foundIndex + 1;
      }
    }

    return substitutions;
  }

  rewriteTextWithMatchedTags(text, substitutions, wordEmbedding = this.wordEmbedding) {
    if (!text || typeof text !== "string" || Object.keys(substitutions).length === 0 || !wordEmbedding?.dict) {
      return text;
    }

    const replacementMap = {};
    for (const [surface, info] of Object.entries(wordEmbedding.dict)) {
      if (!info || typeof info.groupId !== "number") {
        continue;
      }

      const replacement = substitutions[info.groupId];
      if (replacement) {
        replacementMap[surface] = replacement;
      }
    }

    const surfaces = Object.keys(replacementMap).sort((a, b) => {
      const diff = b.length - a.length;
      return diff !== 0 ? diff : a.localeCompare(b);
    });

    if (!surfaces.length) {
      return text;
    }

    let result = "";
    let index = 0;

    while (index < text.length) {
      let matched = false;
      for (const surface of surfaces) {
        if (text.startsWith(surface, index)) {
          result += replacementMap[surface];
          index += surface.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        result += text[index];
        index += 1;
      }
    }

    return result;
  }

  vectorDot(a, b) {
    if (!a || !b || typeof a !== "object" || typeof b !== "object") {
      return 0;
    }

    let sum = 0;
    Object.entries(a).forEach(([key, value]) => {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return;
      }

      const otherValue = b[key];
      if (typeof otherValue === "number" && !Number.isNaN(otherValue)) {
        sum += value * otherValue;
      }
    });

    return sum;
  }

  filterVectorByPrefix(vector, prefix) {
    if (!vector || typeof vector !== 'object' || Array.isArray(vector)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(vector).filter(([key]) => key.startsWith(prefix)),
    );
  }

  getTextIndex({ staticSource = null, firestoreSource = null } = {}) {
    const columns = Array.isArray(staticSource?.columns)
      ? staticSource.columns
      : Array.isArray(firestoreSource?.columns)
        ? firestoreSource.columns
        : [];

    const index = columns.indexOf("text");
    return index !== -1 ? index : 1;
  }

  getPrecisionThreshold({ staticSource = null, firestoreSource = null } = {}) {
    const staticPrecision = typeof staticSource?.factor?.precision === "number" ? staticSource.factor.precision : null;
    const firestorePrecision =
      typeof firestoreSource?.factor?.precision === "number" ? firestoreSource.factor.precision : null;

    if (staticPrecision !== null && firestorePrecision !== null) {
      return Math.min(staticPrecision, firestorePrecision);
    }
    if (staticPrecision !== null) {
      return staticPrecision;
    }
    if (firestorePrecision !== null) {
      return firestorePrecision;
    }
    return this.defaultPrecision;
  }

  hasNextDataRow(rowIndex, dataRows = [], roleIndex = -1) {
    return this.getNextDataRow(rowIndex, dataRows, roleIndex) !== null;
  }

  // roleIndex>=0 のとき role が 'user' の行は飛ばし、bot 行に行き着くまで探す
  getNextDataRow(rowIndex, dataRows = [], roleIndex = -1) {
    if (typeof rowIndex !== "number" || !Array.isArray(dataRows)) {
      return null;
    }

    for (let nextIndex = rowIndex + 1; nextIndex < dataRows.length; nextIndex += 1) {
      const row = dataRows[nextIndex];
      if (row && !row.separator && Array.isArray(row.row)) {
        if (roleIndex >= 0 && row.row[roleIndex] === 'user') {
          continue;
        }
        return row.row;
      }
    }

    return null;
  }
}

export default Retriever;
