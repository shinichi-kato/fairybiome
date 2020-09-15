import Part from "./part.jsx";
import { localStorageIO } from "./localStorageIO";

/* firestore上でのデータの構造
collection("bots")
  .doc(id)
    config: {
      trueName: TextString,
      firstUser: TextString,
      buddyUser: TextString,
      displayName: TextString,
      photoUrl: TextString,
      description: TextString,
      defaultPartOrder: Array,
      hubBehavior: Map,
    },
    state: {
      partOrder: Array,
      activeInHub: Boolean,
      hp: Integer,
      queue: Array,
      buddy: TextString,
    },
    updatedAt: DateAndTime,

    .collection("wordDict")
      .doc("wordDict")
        wordDict: Map // サイズが大きいため別のdocにする

    .collection("parts")
      .doc(`${partName}`) // サイズが大きいため別のdocにする
        behavior: Map
        dict: Array

*/

export default class BiomeBotIO {
  constructor() {
    this.init();
  }

  init = () => {
    // 書誌的事項(会話中に変化しない)
    this.firestoreDocId = null;
    this.firestoreOwnerId = null;
    this.ownerDisplayName = null;
    this.config = {
      trueName: "",
      firstUser: "",
      buddyUser: "",
      displayName: null,
      photoURL: null,
      description: null,
      defaultPartOrder: [],
      hubBehavior: {
        availability: 0.3,
        generosity: 0.9,
        retention: 0.6,
      },
    };

    // 単語辞書(大きいので分離)
    this.wordDict = { empty: true };

    // パート本体(大きいので分離)
    this.parts = { empty: true };

    // 会話中の動的な状態を記述する項目
    this.state = {
      partOrder: [],
      activeInHub: false,
      hp: 0,
      queue: [],
      buddy: null, // null: アンロード状態
      // "none":非バディ,
      // "follow":随行中,
      // "home":ユーザから離れてHomeにいる,
      // "habitat":ユーザから離れてHabitatにいる
    };
    this.updatedAt = null;
  }

  isLoaded = () => {
    return this.state.buddy !== null;
  };

  isVacantInLocalStorage = () => {
    return localStorageIO.getItem("Biomebot.state", false) === false;
  };

  isFairyYoung = () => {
    return this.config.displayName === "";
  }

  getBuddyState = () => {
    const config = localStorageIO.getJson("Biomebot.config", false);
    const state = localStorageIO.getJson("Biomebot.state", false);
    if (!state || !config) {
      return {
        displayName: null,
        photoURL: null,
        buddy: null,
        hp: null
      };
    }
    return {
      displayName: config.displayName,
      photoURL: config.photoURL,
      buddy: state.buddy,
      hp: state.hp
    };
  }

  setConfig = (config, updatedAt) => {
    const b = config.hubBehavior;
    this.config = {
      ...config,
      hubBehavior: {
        availability: parseFloat(b.availability),
        generosity: parseFloat(b.generosity),
        retention: parseFloat(b.retention),
      }
    };
    this.updatedAt = updatedAt;
    localStorageIO.setItem("Biomebot.firestoreOwnerId", this.firestoreOwnerId);
    localStorageIO.setItem("Biomebot.firestoreDocId", this.firestoreDocId);
    localStorageIO.setItem("Biomebot.config", JSON.stringify(this.config));
    localStorageIO.setItem("Biomebot.updatedAt", JSON.stringify(this.updatedAt));
  };

  setPart = (partName, part, updatedAt) => {
    this.parts[partName].readObj(part);
    this.updatedAt = updatedAt;
    localStorageIO.setItem(`Biomebot.part[${partName}]`, JSON.stringify(part));
    localStorageIO.setItem("Biomebot.updatedAt", JSON.stringify(this.updatedAt));
  };

  removePart = (partName) => {
    delete this.parts[partName];
    localStorageIO.removeItem(`Biomebot.part[${partName}]`);
  }

  setWordDict = (wordDict, updatedAt) => {
    this.wordDict = { ...wordDict };
    this.updatedAt = updatedAt;
    localStorageIO.setItem("Biomebot.wordDict", JSON.stringify(this.wordDict));
    localStorageIO.setItem("Biomebot.updatedAt", JSON.stringify(this.updatedAt));
  }

  setState = (state, updatedAt) => {
    this.state = { ...state };
    this.updatedAt = updatedAt;
    localStorageIO.setItem("Biomebot.state", JSON.stringify(this.state));
    localStorageIO.setItem("Biomebot.updatedAt", JSON.stringify(this.updatedAt));
  }

  readObj = (obj) => {
    const b = obj.config.hubBehavior;
    this.firestoreOwnerId = obj.firestoreOwnerId;
    this.ownerDisplayName = obj.ownerDisplayName;
    this.firestoreDocId = obj.firestoreDocId;
    this.config = {
      ...obj.config,
      hubBehavior: {
        availability: parseFloat(b.availability),
        generosity: parseFloat(b.generosity),
        retention: parseFloat(b.retention),
      }
    };

    this.wordDict = { ...obj.wordDict };

    const partNames = Object.keys(obj.parts);
    for (let part of partNames) {
      this.parts[part] = new Part(obj.parts[part]);
    }
    delete this.parts.empty;

    this.state = {
      ...obj.state,
      partOrder: [...obj.config.defaultPartOrder],
    };
  };

  getFairyFromLocalStorage = () => {
    const ownerId = localStorageIO.getItem("Biomebot.firestoreOwnerId");
    const ownerName = localStorageIO.getItem("Biomebot.ownerDisplayName");
    const docId = localStorageIO.getItem("Biomebot.firestoreDocId");
    const state = localStorageIO.getJson("Biomebot.state");
    if (state === null) { return false; }
    const config = localStorageIO.getJson("Biomebot.config");
    const wordDict = localStorageIO.getJson("Biomebot.wordDict");
    const updatedAt = localStorageIO.getJson("Biomebot.updatedAt");

    let parts = new Object();

    for (let partName of config.defaultPartOrder) {
      parts[partName] = localStorageIO.getJson(`Biomebot.part[${partName}]`);
    }

    return {
      firestoreOwnerId: ownerId,
      ownerDisplayName: ownerName,
      firestoreDocId: docId,
      config: {
        ...config,
        hubBehavior: {
          availability: parseFloat(config.hubBehavior.availability),
          generosity: parseFloat(config.hubBehavior.generosity),
          retention: parseFloat(config.hubBehavior.retention),
        }
      },
      wordDict: wordDict,
      parts: parts,
      state: state,
      updatedAt: updatedAt,
    };
  }

  readLocalStorage = () => {
    this.firestoreOwnerId = localStorageIO.getItem("Biomebot.firestoreOwnerId");
    this.ownerDisplayName = localStorageIO.getItem("Biomebot.ownerDisplayname");
    this.firestoreDocId = localStorageIO.getItem("Biomebot.firestoreDocId");
    const state = localStorageIO.getJson("Biomebot.state");
    if (state === null) { return false; }

    const config = localStorageIO.getJson("Biomebot.config");
    this.config = {
      ...config,
      hubBehavior: {
        availability: parseFloat(config.hubBehavior.availability),
        generosity: parseFloat(config.hubBehavior.generosity),
        retention: parseFloat(config.hubBehavior.retention),
      }
    };

    this.wordDict = localStorageIO.getJson("Biomebot.wordDict");
    this.parts = { empty: false };
    for (let partName of config.defaultPartOrder) {
      let part = localStorageIO.getJson(`Biomebot.part[${partName}]`);
      if (this.parts[partName]) {
        this.parts[partName].readObj(part);
      } else {
        this.parts[partName] = new Part(part);
      }
    }

    this.state = { ...state };
    this.updatedAt = localStorageIO.getJson("Biomebot.updatedAt");
    return true;
  };

  upkeepToLocalStorage = () => {
    // this.stateのみ更新
    localStorageIO.setItem("Biomebot.state", JSON.stringify(this.state));
  };

  dumpToLocalStorage = (fairy) => {
    if (fairy) {
      this.readObj(fairy);
    }
    // 全データの保存
    localStorageIO.setItem("Biomebot.firestoreDocId", this.firestoreDocId);
    localStorageIO.setItem("Biomebot.config", JSON.stringify(this.config));
    localStorageIO.setItem("Biomebot.wordDict", JSON.stringify(this.wordDict));

    for (let partName of this.config.defaultPartOrder) {
      localStorageIO.setItem(`Biomebot.part[${partName}]`,
        JSON.stringify(this.parts[partName].dump()));
    }
    localStorageIO.setItem("Biomebot.updatedAt", this.updatedAt);
    this.upkeepToLocalStorage();
  };

  dumpToFirestore = (fb) => {
    // firestoreへの全データの保存
    const ownerId = fb.user.uid;
    const ownerName = fb.user.displayName;
    const fs = fb.firestore;
    if (!this.firestoreDocId || this.firestoreDocId === "undefined") {
      fs.collection("bots")
      .add({
        firestoreOwnerId: ownerId,
        ownerDisplayName: ownerName,
        config: this.config,
        state: {
          partOrder: this.state.partOrder,
          activeInHub: this.state.activeInHub,
          hp: this.state.hp,
          queue: this.state.queue
        },
        buddy: this.state.buddy,
        updatedAt: this.updatedAt
      })
      .then(docRef => {
        console.log("add", docRef.id);
        this.firestoreDocId = docRef.id;
        localStorageIO.setItem("Biomebot.firestoreDocId", this.firestoreDocId);
        docRef.collection("wordDict")
          .doc("wordDict").set(this.wordDict);

        const partsRef = docRef.collection("parts");
        for (let partName of this.config.defaultPartOrder) {
          partsRef.doc(partName).set(this.parts[partName].dump());
        }
      });
    } else {
      const docRef = fs.collection("bots").doc(this.firestoreDocId);
      docRef.set({
        firestoreOwnerId: ownerId,
        ownerDisplayName: ownerName,
        config: this.config,
        state: {
          partOrder: this.state.partOrder,
          activeInHub: this.state.activeInHub,
          hp: this.state.hp,
          queue: this.state.queue
        },
        buddy: this.state.buddy,
        updatedAt: this.updatedAt
      });
      docRef.collection("wordDict")
        .doc("wordDict").set(this.wordDict);

      const partsRef = docRef.collection("parts");
      for (let partName of this.config.defaultPartOrder) {
        partsRef.doc(partName).set(this.parts[partName].dump());
      }
    }
  };
}

export const readFromFirestore = async (fb, docId) => {
  const docRef = fb.firestore.collection("bots").doc(docId);
  const doc = await docRef.get();
  const data = doc.data();
  let fairy = {
    firestoreOwnerId: data.firestoreOwnerId,
    ownerDisplayName: data.ownerDispalyName,
    config: {... data.config},
    state: {
      ... data.state,
      buddy: data.buddy,
    },
    updatedAt: data.updatedAt,
    wordDict: {},
    parts: {}
  };

  const wdRef = docRef.collection("wordDict").doc("wordDict");
  const wdData = await wdRef.get();
  fairy.wordDict = {...wdData.data()};

  const partsRef = docRef.collection("parts");
  const partsData = await partsRef.get();
  for (let part of partsData.docs) {
    let partData = part.data();
    fairy.parts[part.id] = {...partData};
  }

  return fairy;
};
