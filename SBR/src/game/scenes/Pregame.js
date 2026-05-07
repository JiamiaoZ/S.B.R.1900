import { Scene } from 'phaser';

export class Pregame extends Scene {
    constructor() {
        super('Pregame');
    }

    create() {
        this.isTyping = false;
        this.lineIndex = 0;

        this.fullStory = this.cache.json.get('script');
        this.currentSceneData = this.fullStory.stage_1_intro;

        this.bgImage = this.add.image(512, 384, 'background');

        this.characterSprite = this.add.sprite(750, 484, 'character').setScale(2);

        const dialogue_container = this.add.container(512, 384);
        const dialogue_box = this.add.rectangle(0, 250, 900, 200, 0x000000, 0.8).setStrokeStyle(2, 0xffffff);
        
        this.dialogText = this.add.text(-430, 180, '', { 
            font: '24px Arial', 
            fill: '#ffffff', 
            wordWrap: { width: 860 } 
        });

        dialogue_container.add([dialogue_box, this.dialogText]);

        this.choiceContainer = this.add.container(512, 300).setVisible(false);

        this.add.rectangle(512, 384, 1024, 768)
            .setInteractive()
            .on('pointerdown', () => {
                if (!this.isTyping && !this.choiceContainer.visible) {
                    this.nextLine();
                }
            });

        this.nextLine();
    }

    nextLine() {
        if (this.lineIndex < this.currentSceneData.length) {
            const line = this.currentSceneData[this.lineIndex];
            
            if (line.char) this.characterSprite.setTexture(line.char);
            if (line.bg) this.bgImage.setTexture(line.bg);

            if (line.anim === 'slide-in') {
                this.characterSprite.setAlpha(0).setX(1000); // Start off-screen right
                this.tweens.add({ targets: this.characterSprite, x: 750, alpha: 1, duration: 500 });
            }

            this.typewriteText(this.dialogText, line.text);

            if (line.choices) {
                this.time.delayedCall(line.text.length * 40, () => {
                    this.showChoices(line.choices);
                });
            }

            this.lineIndex++;
        } else {
            console.log("End of this story segment!");
            this.scene.start('MainGame');
        }
    }

    typewriteText(label, message) {
        this.isTyping = true;
        label.setText(''); 
        
        let charIndex = 0;
        this.typingTimer = this.time.addEvent({
            delay: 40, 
            repeat: message.length - 1,
            callback: () => {
                label.text += message[charIndex];
                charIndex++;
                if (charIndex === message.length) {
                    this.isTyping = false;
                }
            }
        });
    }

    showChoices(choices) {
        this.choiceContainer.removeAll(true);
        this.choiceContainer.setVisible(true);

        choices.forEach((choice, i) => {
            const btn = this.add.text(0, i * 60, choice.label, {
                backgroundColor: '#222',
                padding: { x: 20, y: 10 },
                fixedWidth: 300
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.choiceContainer.setVisible(false);
                // Optionally jump to a new script branch here
                // this.currentSceneData = this.fullStory[choice.next];
                // this.lineIndex = 0;
                this.nextLine();
            });
            this.choiceContainer.add(btn);
        });
    }
}