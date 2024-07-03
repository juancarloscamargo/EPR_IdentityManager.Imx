import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GapgroupsComponent } from './gapgroups.component';

describe('GapgroupsComponent', () => {
  let component: GapgroupsComponent;
  let fixture: ComponentFixture<GapgroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GapgroupsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GapgroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
