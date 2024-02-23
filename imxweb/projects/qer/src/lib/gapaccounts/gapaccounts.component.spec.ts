import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GapaccountsComponent } from './gapaccounts.component';

describe('GapaccountsComponent', () => {
  let component: GapaccountsComponent;
  let fixture: ComponentFixture<GapaccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GapaccountsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GapaccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
