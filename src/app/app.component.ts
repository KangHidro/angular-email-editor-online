import { Component, HostListener, ViewChild } from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import { timer } from 'rxjs';
import { SystemConstant } from './system.constant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild(EmailEditorComponent)
  private emailEditor: EmailEditorComponent;
  emailEditorMinHeight = 600;
  blockEmailEditorStyle = {};
  emailEditorStyle = {};
  templateMacDinh = localStorage.getItem('draft-email-cfg') ? JSON.parse(localStorage.getItem('draft-email-cfg')) : SystemConstant.EMAIL_TEMPLATE;

  inputEmailCfg = '';
  outputEmailTpl = '';
  outputEmailCfg = '';

  constructor() {
    timer(60000, 60000).subscribe(() => {
      this.emailEditor.editor.saveDesign((data) => {
        localStorage.setItem('draft-email-cfg', JSON.stringify(data));
      });
    });
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

}
