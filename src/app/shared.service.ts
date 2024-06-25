import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private toastController: ToastController
  ) { }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  async get(url=null, params={}, headers={ 'Content-Type': 'application/json' }): Promise<any> {
    const options = {
      url,
      headers,
      params
    };
    const { data:response } = await Http.get(options);
    return response;
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  async post(url=null, data={}, headers={ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin':'*' }): Promise<any> {
    const options = {
      url,
      headers,
      data
    };
    const { data:response } = await Http.post(options);
    return response;
  };

  async alert(message, color='primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      cssClass : 'default-alert',
      color
    });
    await toast.present();
  }

}
