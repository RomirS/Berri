declare module 'formidable' {

    export class IncomingForm{
        public on(arg0: string, arg1: (first: string | any, second?: any) => void) {
            throw new Error("Method not implemented.");
        }
        uploadDir: String;
        keepExtensions: Boolean;
        type: String;
        parse(req, Function) : void;
    }
}