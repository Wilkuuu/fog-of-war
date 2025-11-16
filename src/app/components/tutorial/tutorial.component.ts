import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {
  currentStep: number = 0;
  
  steps = [
    {
      titleKey: 'tutorial.step1.title',
      descriptionKey: 'tutorial.step1.description',
      icon: 'videocam-outline'
    },
    {
      titleKey: 'tutorial.step2.title',
      descriptionKey: 'tutorial.step2.description',
      icon: 'hand-left-outline'
    },
    {
      titleKey: 'tutorial.step3.title',
      descriptionKey: 'tutorial.step3.description',
      icon: 'brush-outline'
    },
    {
      titleKey: 'tutorial.step4.title',
      descriptionKey: 'tutorial.step4.description',
      icon: 'menu-outline'
    }
  ];

  constructor(
    private modalController: ModalController,
    public translation: TranslationService
  ) {}

  ngOnInit() {}

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.close();
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  skip() {
    this.close();
  }

  close() {
    localStorage.setItem('fog-of-war-tutorial-completed', 'true');
    this.modalController.dismiss();
  }

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }
}

