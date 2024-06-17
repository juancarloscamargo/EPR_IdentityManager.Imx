import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface PasscodeParameter {
  Code: string;
  Title: string;
}


@Component({
  selector: 'imx-visorpass',
  templateUrl: './visorpass.component.html',
  styleUrls: ['./visorpass.component.scss']
})
export class VisorpassComponent  {


  constructor(
    private dialogRef: MatDialogRef<VisorpassComponent>,
    @Inject(MAT_DIALOG_DATA) public passcodeParameter: PasscodeParameter,
    
  ) { dialogRef.disableClose = true;
    
   }

  public aceptacambio() {
    
    return true;
  }

}
