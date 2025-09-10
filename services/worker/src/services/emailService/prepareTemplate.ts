import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pug from "pug";
import juice from "juice"

export const prepareTemplate = async <TData extends pug.LocalsObject>(templateName: string, data: TData) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const templateDirs = path.join(__dirname, "template")
        const templatePath = path.join(templateDirs, `${templateName}.pug`);
        const compileFn = pug.compileFile(templatePath, {
            basedir: path.join(__dirname),
        })
        let html = compileFn(data);
        return html;
        
    } catch (error) {
        console.error("Template error" , error);
    }
  
}