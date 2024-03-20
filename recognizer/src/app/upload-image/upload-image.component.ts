import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  // in the controller

  cameras: MediaDeviceInfo[] = [];
  selectedCamera: MediaDeviceInfo | null = null;
  cameraMode = false;

  capturedImage: string = '';
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvas!: ElementRef;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      image: [null, Validators.required],
    });
    console.log('init');
    this.listCameras()
      .then()
      .catch((e) => console.log(e));
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
          this.loading = false;
        },
        (error) => {
          console.error('Error al subir la imagen:', error);
          this.loading = false;
        }
      );
    } catch (error: any) {
      this.loading = false;
      alert(error?.message ?? 'Process error');
    }
  }

  async listCameras() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras = devices.filter((device) => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  }

  selectCamera(camera: MediaDeviceInfo) {
    this.selectedCamera = camera;
    this.startVideo();
  }

  startVideo() {
    if (this.selectedCamera) {
      const constraints = {
        video: { deviceId: this.selectedCamera.deviceId },
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          const videoElement = document.getElementById(
            'selected-video'
          ) as HTMLVideoElement;
          if (videoElement) {
            videoElement.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing camera:', err);
        });
    }
  }

  capture() {
    if (this.videoElement && this.canvas) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvas.nativeElement;
      const context = canvas.getContext('2d');
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Calcular las coordenadas y dimensiones del recorte
      const cropX = videoWidth * 0.5 - videoWidth * 0.2; // left: 50%, width: 40%
      const cropY = videoHeight * 0.8; // top: 80%
      const cropWidth = videoWidth * 0.4;
      const cropHeight = videoHeight * 0.15;

      // Dibujar la imagen recortada en el lienzo
      context.drawImage(
        video,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Convertir el lienzo a un Data URL
      this.capturedImage = canvas.toDataURL('image/png');
    }
  }
}
