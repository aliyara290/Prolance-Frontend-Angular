import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconWrapperComponent } from './icon-wrapper';

describe('IconWrapper', () => {
  let component: IconWrapperComponent;
  let fixture: ComponentFixture<IconWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconWrapperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
