import { Component, HostListener, ViewChild } from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import { encode } from 'js-base64';
import { take, timer } from 'rxjs';
import { SystemConstant } from './system.constant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild(EmailEditorComponent)
  private emailEditor: EmailEditorComponent;
  emailEditorMinHeight = 800;
  blockEmailEditorStyle = {};
  emailEditorStyle = {};
  templateMacDinh = localStorage.getItem('draft-email-cfg') ? JSON.parse(localStorage.getItem('draft-email-cfg')) : SystemConstant.EMAIL_TEMPLATE;

  inputEmailCfg = '';
  outputEmailTpl = '';
  outputEmailTplCurl = '';
  outputEmailCfg = '';
  userEmail = localStorage.getItem('draft-email-user') ?? '<mailUsername>';
  tools = {
    button: { enabled: true },
    divider: { enabled: true },
    form: { enabled: true },
    heading: { enabled: true },
    image: { enabled: true },
    menu: { enabled: true },
    text: { enabled: true },
    timer: { enabled: true },
    video: { enabled: true },
    html: { enabled: true },
  };

  constructor() {
    timer(60000, 60000).subscribe(() => {
      this.emailEditor.editor.saveDesign((data) => {
        localStorage.setItem('draft-email-cfg', JSON.stringify(data));
        localStorage.setItem('draft-email-user', this.userEmail);
      });
    });
    timer(1000, 1000).pipe(take(10)).subscribe(() => this.onResize());
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    const emailEditorCompWidth = document?.getElementById('email-editor')?.offsetWidth;
    const emailEditorBlockHeight = document?.getElementById('block-email-editor')?.offsetWidth;
    const ratio = emailEditorBlockHeight / emailEditorCompWidth;
    this.emailEditor.minHeight = this.emailEditorMinHeight + 'px';
    if (ratio < 1) {
      this.blockEmailEditorStyle = { height: Math.floor(this.emailEditorMinHeight * ratio) + 'px' };
      this.emailEditorStyle = { transformOrigin: '0 0', transform: `scale(${ratio.toFixed(2)})` };
    } else {
      this.blockEmailEditorStyle = {};
      this.emailEditorStyle = {};
    }
  }

  onSubmit(): void {
    // this.spinner.show();
    this.emailEditor.editor.saveDesign((data) => {
      this.outputEmailCfg = JSON.stringify(data);
      this.emailEditor.editor.exportHtml((data2) => {
        this.outputEmailTpl = data2.html;
        this.outputEmailTplCurl = `From: ${this.userEmail}@gmail.com\nTo: ${this.userEmail}@gmail.com\n` +
          'Subject: SendTestMail\n' +
          'MIME-Version: 1.0\nContent-Type: multipart/mixed; boundary=\"MULTIPART-ALTERNATIVE-BOUNDARY\"\n\n' +
          '--MULTIPART-ALTERNATIVE-BOUNDARY\nContent-Type: text/html; charset=utf-8\n' + 'Content-Transfer-Encoding: base64\nContent-Disposition: inline\n\n' + encode(data2.html) +
          '\n--MULTIPART-ALTERNATIVE-BOUNDARY--';
      });
    });
  }

  editorLoaded() {
    this.emailEditor.loadDesign(this.templateMacDinh);
  }

  loadCustomEmailCfg() {
    this.emailEditor.loadDesign(JSON.parse(this.inputEmailCfg));
  }

  resetTemplateMacDinh() {
    localStorage.removeItem('draft-email-cfg');
    this.templateMacDinh = SystemConstant.EMAIL_TEMPLATE;
    this.editorLoaded();
  }

  replaceEmailPlaceholder(newEmail: string) {
    this.outputEmailTplCurl = this.outputEmailTplCurl.replace(new RegExp(this.userEmail, 'g'), newEmail);
    this.userEmail = newEmail;
  }

  downloadTextContent(content: string, filename: string) {
    const url = window.URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

}
