import {Matrixize,Retrieve} from "./worker/textRetriever.worker.js"


export const matrixize = typeof window === 'object' && new Matrixize()
export const retrieve = typeof window === 'object' && new Retrieve()
