import { Component, EventEmitter, Input, OnInit, Output , OnChanges, DoCheck, AfterContentChecked, AfterContentInit } from '@angular/core';
import { OptionButtonsModel } from 'src/app/DataModels/tool-bar-buttons.model';
import { OptionButtonsService } from 'src/app/Services/tool-bar-buttons.service';

// Rename 'app-options-buttons'
@Component({
  selector: 'app-options-buttons',
  templateUrl: './options-buttons.component.html',
  styleUrls: ['./options-buttons.component.scss']
})



export class OptionsButtonsComponent implements OnInit {

  @Input() inputButtons: OptionButtonsModel[] | null = null;
  @Output() sidenavClose = new EventEmitter<void>(); // side nav close listner?? - useless

  buttonsToView: OptionButtonsModel[] | null;

  private albumButtons = [
    { buttonName: 'My Albums', buttonLink : '/album', },
    { buttonName: 'Add Album', buttonLink: '/album/create', },
  ];

  private groupButtons = [
    { buttonName: 'My Groups', buttonLink : '/groups', },
    { buttonName: 'Add Group', buttonLink: '/group/create', },
  ];

  constructor(
    private toolBarButtonsService: OptionButtonsService,
    ) { }

  ngOnInit() {
    this.inputButtons = this.toolBarButtonsService.getButtons();
    // console.log('inputButtons: ');
    // console.log(this.inputButtons);
  }


  onCloseSideNav() {
    this.inputButtons = this.toolBarButtonsService.getButtons();
    // console.log('inputButtons: ');
    // console.log(this.inputButtons);
    this.sidenavClose.emit();
    //this.toolBarButtonsService.sidenavClose.subscribe();
  }
}
