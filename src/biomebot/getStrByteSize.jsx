export function getStrByteSize(str) {
    /*
      UTF-8文字列のバイトサイズを取得
      http://yamataka.hatenablog.com/entry/2016/02/24/180326
    */
   let count = 0;
   for (let i = 0; i < str.length; ++i) {
       let cp = str.charCodeAt(i);

       if (cp <= 0x007F) {
           // U+0000 - U+007F
           count += 1;
       } else if (cp <= 0x07FF) {
           // U+0080 - U+07FF
           count += 2;
       } else if (cp <= 0xD7FF) {
           // U+0800 - U+D7FF
           count += 3;
       } else if (cp <= 0xDFFF) {
           // U+10000 - U+10FFFF
           //
           // 0xD800 - 0xDBFF (High Surrogates)
           // 0xDC00 - 0xDFFF (Low Surrogates)
           count += 2;
       } else if (cp <= 0xFFFF) {
           // U+E000 - U+FFFF
           count += 3;
       } else {
           // undefined code point in UTF-16
           // do nothing
       }
   }
   return count;
}
