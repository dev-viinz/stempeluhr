export enum ErrorCodes {
    "UNKNOWN",
    "CODE_EXCHANGE_FAILED"
}

export type ErrorStruct = {
    title: string,
    message: string
    goto?: string,
    gotoTitle?: string
}

export function getUserErrorMessage(code: ErrorCodes): ErrorStruct {
    switch (code) {
        case ErrorCodes.CODE_EXCHANGE_FAILED:
            return {
                title: 'Error exchanging codes:',
                message: 
                `Unfortunately we couldn't process your request.
                This is likely caused by using an incognito tab, or by switching devices mid process.
                Please try again later.`,
                goto: '/login',
                gotoTitle: 'Back to login'
            }
        default:
            return {
                title: 'Unknown error:',
                message: 
                `An error has occured.
                Please try again later.`
            }
    }
}
