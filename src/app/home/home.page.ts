/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SharedService } from '../shared.service';
import { environment } from './../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Howl } from 'howler';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  cameraScreen = false;
  previewSrc: SafeResourceUrl = null;
  finalText = null;
  interpreter = null;
  audioContentBase64 = '';
  contentChanged = false;
  sound: Howl;
  player = {
    visibility: false,
    playButton: 'fa fa-pause',
    stopButton: 'fa fa-times',
    status: 'Playing'
  };
  progressBarPercent = '0%';
  percentInterval = null;

  interpreterSelectOptions = [
    {
      value: JSON.stringify({gender:'male', lang:'bs-BA', voice: 'bs-BA-GoranNeural'}),
      text: 'Bosnian (Male)'
    },
    {
      value: JSON.stringify({gender:'female', lang:'bs-BA', voice: 'bs-BA-VesnaNeural'}),
      text: 'Bosnian (Female)'
    },
    {
      value: JSON.stringify({gender:'male', lang:'hr-HR', voice: 'hr-HR-SreckoNeural'}),
      text: 'Croatian (Male)'
    },
    {
      value: JSON.stringify({gender:'female', lang:'hr-HR', voice: 'hr-HR-GabrijelaNeural'}),
      text:'Croatian (Female)'
    },
    {
      value: JSON.stringify({gender:'male', lang:'en-US', voice: 'en-US-AIGenerate1Neural'}),
      text: 'English (Male)'
    },
    {
      value: JSON.stringify({gender:'female', lang:'en-US', voice: 'en-US-AIGenerate2Neural'}),
      text: 'English (Female)'
    }
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private shared: SharedService,
    private ngxLoader: NgxUiLoaderService
    ) {

    }

    async takePicture() {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Base64
        });
        this.ngxLoader.start();
        const imageUrl = `data:image/${image.format};base64,${image.base64String}`;
        this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(imageUrl);
        const data = await this.shared.post(`${environment.api}/ocr`, {
          image: image.base64String
        });
        this.finalText = data;
        this.cameraScreen = true;
      } catch (error) {
        this.cameraScreen = false;
        this.shared.alert(error.message || 'unknown error occurred', 'danger');
      } finally {
        this.ngxLoader.stop();
      }
    };

    clear() {
      this.cameraScreen = false;
      this.finalText = '';
      this.interpreter = null;
      this.audioContentBase64 = '';
      this.contentChanged = false;
    }

    async processText(): Promise<void> {
      try {
        if (!this.interpreter || !this.finalText) {
          throw new Error('Choose interpreter and fill content');
        }
        if (this.audioContentBase64 && !this.contentChanged ) {
           this.openSwall();
           return;
        }
        this.ngxLoader.start();
        this.audioContentBase64 = await this.shared.post(`${environment.api}/read`, {
          text: `${this.finalText}`,
          interpreter: JSON.parse(this.interpreter)
        });
        this.contentChanged = false;
        this.openSwall();
      } catch (error) {
        console.error(error.message);
        this.shared.alert(error.message, 'danger');
      } finally {
        this.ngxLoader.stop();
      }

    }

    async readIt() {
      try {
        await this.startPlayingTrack(this.audioContentBase64);
      } catch (error) {
        console.error(error.message);
        this.shared.alert(error.message, 'danger');
      }
    }

    private startPlayingTrack(base64audio: string): Promise<boolean> {
      return new Promise(async (resolve, reject) => {
        try {
          this.sound = new Howl({
            src: [`data:audio/mpeg;base64,${base64audio}`],
            html5: true,
            onend: () => {
              this.player = {
                ...this.player,
                playButton:'fa fa-play',
                stopButton:'fa fa-times',
                status: 'Stopped'
              };
            }
          });
          this.sound.play();
          this.player.visibility = true;
          this.percentInterval = this.setInt();
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    }

    async downloadIt() {
      try {
        this.ngxLoader.start();
        const blob = this.makeBlobFromBase64(this.audioContentBase64);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        if (!this.finalText) {
          throw new Error('Action not permitted, try again!');
        }
        a.download = `${this.finalText.slice(0,32).replaceAll(' ','_')}_${Date.now()}.mp3`;
        a.click();
      } catch (error) {
        console.error(error.message);
        this.shared.alert(error.message, 'danger');
      } finally {
        this.ngxLoader.stop();
      }
    }

    private makeBlobFromBase64(base64String: string) {
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray]);
    }

    private async openSwall(): Promise<void> {
      try {
        const swal = await Swal.fire({
          title: 'Audio is ready!',
          // text: 'Choose your action',
          heightAuto: false,
          showConfirmButton: true,
          confirmButtonText: '<i class="fa fa-play"></i> Play',
          confirmButtonAriaLabel: 'Play',
          showDenyButton: true,
          denyButtonText: '<i class="fa fa-download"> Download</i>',
          denyButtonAriaLabel: 'Download',
          showCloseButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            title: 'swal2-title',
            popup: 'swal2-popup',
          }
        });
        const {isConfirmed, isDenied} = swal;
        if (isConfirmed) {
          this.readIt();
        }
        if (isDenied) {
          this.downloadIt();
        }
      } catch (error) {
        this.shared.alert(error.message, 'danger');
      }
    }

    detectModelChange() {
      this.contentChanged = true;
    }

    handleInterpreterChange(event: any) {
      this.interpreter = event.detail.value;
      this.detectModelChange();
    }

    soundStop() {
      this.clearInt(this.percentInterval);
      this.sound.stop();
      this.player = {
        visibility: false,
        playButton: 'fa fa-pause',
        stopButton: 'fa fa-times',
        status: 'Playing'
      };
      this.percentInterval = '0%';
    }

    soundBackward() {
      if (this.sound.seek() < 5) {
        this.sound.seek(0);
        return;
      }
      this.sound.seek(this.sound.seek() - 5);
    }

    soundForward() {
      this.sound.seek(this.sound.seek() + 5);
    }

    soundToggle() {
      if (this.player.playButton === 'fa fa-pause') {
        this.player = {
          ...this.player,
          playButton: 'fa fa-play',
          status: 'Paused'
        };
        this.sound.pause();
        return;
      }
      this.player = {
        ...this.player,
        playButton: 'fa fa-pause',
        status: 'Playing'
      };
      this.sound.play();
    }

    setInt() {
      return setInterval(() => {
        this.progressBarPercent = `${this.sound.seek() / this.sound.duration() * 101}%`;
      }, 1000);
    }

    clearInt(name) {
      clearInterval(name);
    }

  }
