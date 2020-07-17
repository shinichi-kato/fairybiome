export function toTimestampString(timestamp){
	/*
	 firebaseのTimestampはlocalStorageに保存されるときに
	　Timestamp(seconds=1578745004, nanoseconds=743000000)
	　という文字列に変換される。文字列からJavascriptのDate型を復元するため
		正規表現を利用する。

		firebaseのマニュアルではtoMillis()などが記載されているが、
		ToString()は共通なのでこれを利用
	
	*/ 
	if (timestamp) {
		const datestr = timestamp.toString();
	
		const r = datestr.match(/seconds=([0-9]+)/);
		// r = ["seconds=12453340","12453340"]
		let d = new Date(r[1]*1000);
		return	`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.toLocaleTimeString()}`;
	}
	return " ";
}