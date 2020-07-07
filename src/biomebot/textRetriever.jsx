import TextRetriever from "./worker/textRetriever.worker.js"


const textRetriever = typeof window === 'object' && new TextRetrueverSearchWorker()

export default textRetriever