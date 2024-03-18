import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-upload-image',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.css',
})
export class UploadImageComponent implements OnInit {
  uploadForm!: FormGroup;
  uploadResponse: any;
  loading = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      image: [null, Validators.required],
    });
  }

  onFileSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (file != null) {
      this.uploadForm.get('image')?.setValue(file);
    }
  }

  async onSubmit(): Promise<void> {
    this.loading = true;
    try {
      function format(plate: string): { result: string; type: 'new' | 'old' } {
        if (plate.length === 7) {
          return {
            result:
              plate.slice(0, 2) +
              ' ' +
              plate.slice(2, 5) +
              ' ' +
              plate.slice(5),
            type: 'new',
          };
        }
        if (plate.length === 6) {
          return {
            result: plate.slice(0, 3) + ' ' + plate.slice(3),
            type: 'old',
          };
        }
        return {
          result: plate,
          type: 'new',
        };
      }

      const formData = new FormData();
      const file: File = this.uploadForm.get('image')?.value as File;
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };
      const compressedFile = await imageCompression(file, options);
      formData.append('photo', compressedFile, file.name);

      const url = location.href.includes('localhost')
        ? 'http://localhost/api'
        : '/api';
      this.http.post<any>(`${url}/upload`, formData).subscribe(
        (response) => {
          this.uploadResponse = response;
          const formatted = format(this.uploadResponse.result);
          this.uploadResponse.result = formatted.result;
          this.uploadResponse.type = formatted.type;
        },
        (error) => {
          console.error('Error al subir la imagen:', error);
        }
      );
    } catch (error: any) {
      alert(error?.message ?? 'Process error');
    }
    this.loading = false;
  }
}
