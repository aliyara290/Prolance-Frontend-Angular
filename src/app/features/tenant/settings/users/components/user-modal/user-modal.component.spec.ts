import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserModalComponent } from './user-modal.component';

describe('UserModalComponent', () => {
  let component: UserModalComponent;
  let fixture: ComponentFixture<UserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
