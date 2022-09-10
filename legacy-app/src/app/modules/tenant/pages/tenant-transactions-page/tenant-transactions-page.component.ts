import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  LoadTransactionsGQL,
  LoadTransactionsQuery,
} from '@tumi/legacy-app/generated/generated';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tenant-transactions-page',
  templateUrl: './tenant-transactions-page.component.html',
  styleUrls: ['./tenant-transactions-page.component.scss'],
})
export class TenantTransactionsPageComponent implements OnInit, OnDestroy {
  public displayedColumns = [
    'subject',
    'amount',
    'direction',
    'status',
    'date',
    'user',
    'event',
    // 'role',
    // 'action',
  ];
  public transactions$: Observable<LoadTransactionsQuery['transactions']>;
  public transactionCount$: Observable<
    LoadTransactionsQuery['transactionCount']
  >;
  public sumAmount$: Observable<LoadTransactionsQuery['transactionSumAmount']>;
  public netAmount$: Observable<LoadTransactionsQuery['transactionNetAmount']>;
  public filterForm = new FormGroup({
    range: new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
    }),
    search: new FormControl(''),
  });
  private loadTransactionsRef;
  private destroyed$ = new Subject();

  constructor(
    private loadTransactionsGQL: LoadTransactionsGQL,
    private title: Title
  ) {
    this.title.setTitle('Transactions - TUMi');
    this.loadTransactionsRef = this.loadTransactionsGQL.watch({
      take: 20,
      skip: 0,
    });
    this.transactions$ = this.loadTransactionsRef.valueChanges.pipe(
      map((res) => res.data.transactions)
    );
    this.transactionCount$ = this.loadTransactionsRef.valueChanges.pipe(
      map((res) => res.data.transactionCount)
    );
    this.sumAmount$ = this.loadTransactionsRef.valueChanges.pipe(
      map((res) => res.data.transactionSumAmount)
    );
    this.netAmount$ = this.loadTransactionsRef.valueChanges.pipe(
      map((res) => res.data.transactionNetAmount)
    );
  }

  ngOnInit() {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value) => {
        this.loadTransactionsRef.refetch({
          range: {
            start: value.range?.start,
            end: value.range?.end,
          },
          search: value.search ?? undefined,
        });
      });
  }

  updatePage($event: PageEvent): void {
    this.loadTransactionsRef.refetch({
      skip: $event.pageIndex * $event.pageSize,
      take: $event.pageSize,
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
