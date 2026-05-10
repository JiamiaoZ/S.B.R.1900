export class DialogueManager {
    constructor(scene) {
        this.scene = scene;
        this.isTyping = false;
        this.lineIndex = 0;
        this.currentChoices = null;
        this.choicesShown = false;
        this.currentTypingLabel = null;
        this.currentTypingMessage = null;
        this.currentTypingComplete = null;
        this.typingTimer = null;
    }

    // Initialize with scene references
    init(sceneData) {
        this.currentSceneData = sceneData.currentSceneData;
        this.dialogText = sceneData.dialogText;
        this.characterSprite = sceneData.characterSprite;
        this.bgImage = sceneData.bgImage;
        this.choiceContainer = sceneData.choiceContainer;
        this.fullScreenRect = sceneData.fullScreenRect;
        this.fullStory = sceneData.fullStory;
        this.onChoiceSelected = sceneData.onChoiceSelected; // Callback for choice handling
    }

    nextLine() {
        if (this.lineIndex < this.currentSceneData.length) {
            const line = this.currentSceneData[this.lineIndex];
            
            if (line.char) this.characterSprite.setTexture(line.char);
            if (line.bg) this.bgImage.setTexture(line.bg);

            if (line.anim === 'slide-in') {
                this.characterSprite.setAlpha(0).setX(1000); // Start off-screen right
                this.scene.tweens.add({ targets: this.characterSprite, x: 750, alpha: 1, duration: 500 });
            }

            this.currentChoices = line.choices || null;
            this.choicesShown = false;
            this.typewriteText(this.dialogText, line.text, () => {
                if (this.currentChoices && !this.choicesShown) {
                    this.showChoices(this.currentChoices);
                }
            });

            this.lineIndex++;
        } else {
            console.log("End of this story segment!");
            this.scene.scene.start('Game');
        }
    }

    typewriteText(label, message, onComplete) {
        this.isTyping = true;
        label.setText('');
        this.currentTypingLabel = label;
        this.currentTypingMessage = message;
        this.currentTypingComplete = onComplete;

        let charIndex = 0;
        this.typingTimer = this.scene.time.addEvent({
            delay: 40,
            repeat: message.length - 1,
            callback: () => {
                label.text += message[charIndex];
                charIndex++;
                if (charIndex === message.length) {
                    this.isTyping = false;
                    if (this.currentTypingComplete) {
                        this.currentTypingComplete();
                        this.currentTypingComplete = null;
                    }
                }
            }
        });
    }

    fastForwardTyping() {
        if (!this.isTyping || !this.typingTimer) {
            return;
        }

        this.typingTimer.remove();
        this.currentTypingLabel.setText(this.currentTypingMessage);
        this.isTyping = false;

        if (this.currentTypingComplete) {
            this.currentTypingComplete();
            this.currentTypingComplete = null;
        }

        this.currentTypingLabel = null;
        this.currentTypingMessage = null;
    }

    showChoices(choices) {
        this.choiceContainer.removeAll(true);
        this.choiceContainer.setVisible(true);
        this.choiceContainer.setDepth(1);
        this.fullScreenRect.disableInteractive();
        this.choicesShown = true;
        this.currentChoices = null;
        this.currentTypingLabel = null;
        this.currentTypingMessage = null;
        this.currentTypingComplete = null;

        choices.forEach((choice, i) => {
            const btn = this.scene.add.text(0, i * 60, choice.label, {
                backgroundColor: '#222',
                padding: { x: 20, y: 10 },
                fixedWidth: 300
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', async () => {
                this.choiceContainer.setVisible(false);
                this.fullScreenRect.setInteractive();

                // Call the scene's choice handler
                if (this.onChoiceSelected) {
                    await this.onChoiceSelected(choice);
                }

                // Jump to a new script branch
                this.currentSceneData = this.fullStory[choice.next];
                this.lineIndex = 0;
                this.nextLine();
            });
            this.choiceContainer.add(btn);
        });
    }
}