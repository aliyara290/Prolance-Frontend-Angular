import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityListSkeletonComponent } from './entity-list-skeleton.component';

describe('EntityListSkeletonComponent', () => {
  let component: EntityListSkeletonComponent;
  let fixture: ComponentFixture<EntityListSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityListSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityListSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
