import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GapaccountsSidesheetsComponent } from './gapaccounts-sidesheets.component';

describe('GapaccountsSidesheetsComponent', () => {
  let component: GapaccountsSidesheetsComponent;
  let fixture: ComponentFixture<GapaccountsSidesheetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GapaccountsSidesheetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GapaccountsSidesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
