import { Scene } from 'phaser';
import { supabase } from '../main';

export class Pregame extends Scene {
    constructor() {
        super('Pregame');
    }

    displayLine(lineData) {
        // 1. Change Background
        this.bgImage.setTexture(lineData.bg);

        // 2. Character Animation
        if (lineData.anim === 'slide-in') {
            this.character.setAlpha(0).setX(-100);
            this.tweens.add({ targets: this.character, x: 200, alpha: 1, duration: 500 });
        }

        // 3. Typewriter Effect
        this.typewriteText(this.dialogText, lineData.text);
    }

    typewriteText(label, message) {
        this.isTyping = true;
        label.setText(''); // Clear existing text
        
        let charIndex = 0;
        const timer = this.time.addEvent({
            delay: 40, // Speed of typing in ms
            repeat: message.length - 1,
            callback: () => {
                label.text += message[charIndex];
                charIndex++;
                
                if (charIndex === message.length) {
                    this.isTyping = false;
                    timer.destroy();
                }
            }
        });
    }

    create() {
        const isTyping = false;

        this.add.image(512, 384, 'background');

        this.add.sprite(750, 484, 'character').setScale(2);

        const dialogue_container = this.add.container(512, 384);
        const dialogue_box = this.add.rectangle(0, 200, 800, 200, 0x000000, 0.8);

        const choice_container = this.add.container(0, 50);
        //TODO: add choice buttons to choice_container

        dialogue_container.add([dialogue_box]);

        const clickArea = this.add.rectangle(512, 384, 1024, 768).setInteractive();
        clickArea.on('pointerdown', () => {
            if (!this.isTyping) {
                fetch('assets/script.json')
                    .then(response => response.json())
                    .then(data => {
                        const lineData = data['stage_1_intro'][0];
                    });

                this.displayLine(lineData);
            }
        });
    }
}