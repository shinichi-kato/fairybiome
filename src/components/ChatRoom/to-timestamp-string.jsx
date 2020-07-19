export function toTimestampString(timestamp){
	/*
		ログのタイムスタンプには全てfirebase.firestore.Timestamp.now()を
		利用する。これはFirebaseContextからfb.timestampNow()で利用できる。
		ログはfirestoreまたはlocalStorageに保存され、後者の場合は
		ToStringされたものが保存される。
		つまりタイムスタンプの値を可読化する場合はtimestampオブジェクトか
		stringかのどちらかが与えられる。そこで入力値をまずtoStringで文字列化し、
		処理を一本化する。toStringにより、タイムスタンプは

	　Timestamp(seconds=1578745004, nanoseconds=743000000)
	　
		という文字列に変換される。文字列からJavascriptのDate型を復元するため
		正規表現を利用し、配列のkeyにできるようにミリ秒まで表示する。
	
	*/ 
	if (timestamp) {
		const datestr = timestamp.toString();
	
		const r = datestr.match(/seconds=([0-9]+), nanoseconds=([0-9][0-9][0-9])/);
		// r = ["seconds=1578745004, nanoseconds=743","1578745004","743"]
		let d = new Date(r[1]*1000);
		return	`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}.${d.toLocaleTimeString()} ${r[2]}`;
	}
	return " ";
}