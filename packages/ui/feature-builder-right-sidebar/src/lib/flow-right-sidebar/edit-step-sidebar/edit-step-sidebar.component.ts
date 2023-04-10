import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  Observable,
  of,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import { ActionType } from '@activepieces/shared';
import {
  BuilderSelectors,
  FlowItem,
  FlowsActions,
  NO_PROPS,
  RightSideBarType,
} from '@activepieces/ui/feature-builder-store';
import { FlowItemDetails } from '@activepieces/ui/common';

@Component({
  selector: 'app-edit-step-sidebar',
  templateUrl: './edit-step-sidebar.component.html',
  styleUrls: ['./edit-step-sidebar.component.css'],
})
export class NewEditPieceSidebarComponent implements OnInit {
  constructor(private store: Store, private cd: ChangeDetectorRef) {}
  displayNameChanged$: BehaviorSubject<string> = new BehaviorSubject('Step');
  selectedStepAndFlowId$: Observable<{
    step: FlowItem | null | undefined;
    flowId: UUID | null;
  }>;
  selectedFlowItemDetails$: Observable<FlowItemDetails | undefined>;
  flowId$: Observable<null | UUID>;
  ngOnInit(): void {
    //in case you switch piece while the edit piece panel is opened
    this.selectedStepAndFlowId$ = combineLatest({
      step: this.store.select(BuilderSelectors.selectCurrentStep),
      flowId: this.store.select(BuilderSelectors.selectCurrentFlowId),
    }).pipe(
      distinctUntilChanged((prev, current) => {
        return (
          prev.flowId === current.flowId &&
          prev.step?.name === current.step?.name
        );
      }),
      tap((result) => {
        if (result.step) {
          this.displayNameChanged$.next(result.step.displayName);
          this.selectedFlowItemDetails$ = this.store.select(
            BuilderSelectors.selectFlowItemDetails(result.step)
          );
          this.cd.detectChanges();
        } else {
          this.selectedFlowItemDetails$ = of(undefined);
        }
      })
    );
  }

  closeSidebar() {
    this.store.dispatch(
      FlowsActions.setRightSidebar({
        sidebarType: RightSideBarType.NONE,
        props: NO_PROPS,
      })
    );
  }
  get ActionType() {
    return ActionType;
  }
}