import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GapgroupsSidesheetComponent } from './gapgroups-sidesheet.component';

describe('GapgroupsSidesheetComponent', () => {
  let component: GapgroupsSidesheetComponent;
  let fixture: ComponentFixture<GapgroupsSidesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GapgroupsSidesheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GapgroupsSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
