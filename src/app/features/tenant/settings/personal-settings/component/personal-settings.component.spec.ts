import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalSettingsComponent } from './personal-settings.component';

describe('PersonalSettingsComponent', () => {
  let component: PersonalSettingsComponent;
  let fixture: ComponentFixture<PersonalSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalSettingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
