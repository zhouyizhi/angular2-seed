// Third party library.
import { Component, OnInit, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { PortalService } from './portal-service';

interface Document {
    open(): void;
    print(): void;
    download(defaultFileName: string, callBack: any): void;
}
interface PdfMake {
    createPdf(documentDefinition: any): Document;
    fonts: any;
}

declare var pdfMake: PdfMake;

@Component({
    template: require('./portal.html'),
    providers: [
        PortalService
    ]
})
export class PortalComponent implements OnInit {

    public content: SafeHtml;

    constructor(private elementRef: ElementRef, public sanitizer: DomSanitizer, public portalService: PortalService) {
    }

    ngOnInit() {
        this.getHTML();
    }

    getHTML(): void {
        this.portalService.getHTML().then((content) => {
            let scriptReg = /<script type="text\/javascript">((\n|.)*)<\/script>/g;
            let scriptFound = content.match(scriptReg);
            if (scriptFound) {
                for (let i = 0; i < scriptFound.length; i++) {
                    let source = scriptFound[i].replace(scriptReg, '$1');
                    eval(source);
                }
            }
            let scriptSrcReg = /<script type="text\/javascript" src="(.*)"><\/script>/g;
            let scriptSrcFound = content.match(scriptSrcReg);
            if (scriptSrcFound) {
                for (let i = 0; i < scriptSrcFound.length; i++) {
                    let source = scriptSrcFound[i].replace(scriptSrcReg, '$1');
                    var tag = document.createElement('script');
                    tag.type = 'text/javascript';
                    tag.src = source;
                    console.log(source);
                    console.log(this.elementRef.nativeElement);
                    this.elementRef.nativeElement.appendChild(tag);
                }
            }
            content = content.replace(scriptReg, '');
            content = content.replace(scriptSrcReg, '');
            this.content = this.sanitizer.bypassSecurityTrustHtml(content);
        });
    }

    createPDF() {
        this.portalService.getData().then(
            data => {
                pdfMake.fonts = {
                    mplus: {
                        normal: 'mplus-1p-regular.ttf',
                        bold: 'mplus-1p-regular.ttf',
                        italics: 'mplus-1p-regular.ttf',
                        bolditalics: 'mplus-1p-regular.ttf'
                    }
                };
                let documentDefinition = data;
                let document: Document = pdfMake.createPdf(documentDefinition);
                console.log(document);
                document.open();
            },
            error => {
                alert(error);
            });
    }

    createPDF2() {
        this.portalService.getRawData().then(
            data => {
                pdfMake.fonts = {
                    mplus: {
                        normal: 'mplus-1p-regular.ttf',
                        bold: 'mplus-1p-regular.ttf',
                        italics: 'mplus-1p-regular.ttf',
                        bolditalics: 'mplus-1p-regular.ttf'
                    }
                };
                let documentDefinition = eval('(function() { var doc = ' + data + '; return doc; }())');
                console.log(documentDefinition);
                let document: Document = pdfMake.createPdf(documentDefinition);
                console.log(document);
                document.open();
            },
            error => {
                alert(error);
            });
    }
}
