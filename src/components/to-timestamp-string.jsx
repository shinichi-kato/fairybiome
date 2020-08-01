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
	console.log(timestamp)
	if(timestamp){
		let d;
		let ms;
		if(typeof timestamp === "object" && timestamp !== null){
			d = new Date(timestamp.seconds*1000);
			ms = `${timestamp.nanoseconds}`.substr(0,3);
		}
		else {
			const datestr = timestamp.toString();
			const r = datestr.match(/seconds=([0-9]+), nanoseconds=([0-9][0-9][0-9])/);
			d = new Date(r[1]*1000);
			ms = r[2]
		}
		return	`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}.${d.toLocaleTimeString()} ${ms}`;
	}

	return "タイムスタンプが無効です"
}