import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UploadImageComponent } from "./upload-image/upload-image.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
  imports: [CommonModule, RouterOutlet, UploadImageComponent]
})
export class AppComponent {
  title = 'recognizer';
}
