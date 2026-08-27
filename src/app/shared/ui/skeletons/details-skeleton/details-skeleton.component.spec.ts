import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSkeletonComponent } from './details-skeleton.component';

describe('DetailsSkeletonComponent', () => {
  let component: DetailsSkeletonComponent;
  let fixture: ComponentFixture<DetailsSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
