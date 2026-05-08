import { Scene } from 'phaser';
import { supabase } from '../main'

export class Pregame extends Scene {
    constructor() {
        super('Pregame');
    }

    async create() {
        // Initialize playerStats with defaults in case fetch fails
        this.playerStats = { food: 0, health: 0 };

        // Show a "Loading..." text if you want
        const loadingText = this.add.text(512, 384, 'Loading Data...', { fill: '#fff' }).setOrigin(0.5);

        // Wait for the data to arrive
        await this.fetchPlayerData();

        // Remove loading text and start the game logic
        loadingText.destroy();


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
        this.currentChoices = null;
        this.choicesShown = false;
        this.currentTypingLabel = null;
        this.currentTypingMessage = null;
        this.currentTypingComplete = null;

        this.fullScreenRect = this.add.rectangle(512, 384, 1024, 768)
            .setInteractive()
            .on('pointerdown', () => {
                if (this.isTyping) {
                    this.fastForwardTyping();
                    return;
                }

                if (!this.choiceContainer.visible) {
                    if (this.currentChoices && !this.choicesShown) {
                        this.showChoices(this.currentChoices);
                    } else {
                        this.nextLine();
                    }
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
            this.scene.start('Game');
        }
    }

    typewriteText(label, message, onComplete) {
        this.isTyping = true;
        label.setText('');
        this.currentTypingLabel = label;
        this.currentTypingMessage = message;
        this.currentTypingComplete = onComplete;

        let charIndex = 0;
        this.typingTimer = this.time.addEvent({
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
            const btn = this.add.text(0, i * 60, choice.label, {
                backgroundColor: '#222',
                padding: { x: 20, y: 10 },
                fixedWidth: 300
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', async () => {
                this.choiceContainer.setVisible(false);
                this.fullScreenRect.setInteractive();

                if (choice.db) {
                    console.log("Updating stats with:", choice.db);
                    await this.updatePlayerStats(choice.db);
                }

                // Optionally jump to a new script branch here
                this.currentSceneData = this.fullStory[choice.next];
                this.lineIndex = 0;
                this.nextLine();
            });
            this.choiceContainer.add(btn);
        });
    }

    async updatePlayerStats(modifiers) {
        // 1. Apply changes locally (e.g., if modifiers is {food: 1}, it adds 1)
        for (let key in modifiers) {
            if (this.playerStats.hasOwnProperty(key)) {
                this.playerStats[key] += modifiers[key];
            } else {
                // If the key doesn't exist yet, initialize it
                this.playerStats[key] = modifiers[key];
            }
        }

        console.log("Local playerStats after update:", this.playerStats);

        // 2. Sync with Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            console.error("No authenticated user found", userError);
            return;
        }

        console.log("User ID:", user.id);
        console.log("Sending to Supabase:", modifiers);

        // Only send the modified fields, not the entire object
        const { data, error } = await supabase
            .from('PlayerStats')
            .update(modifiers)
            .eq('id', user.id)
            .select('id, food, health');

        if (error) {
            console.error("Database update failed:", error.message, error.code, error.details);
        } else {
            console.log("Stats updated successfully. Update response:", data);
        }

        const { data: refreshedRow, error: refreshError } = await supabase
            .from('PlayerStats')
            .select('id, food, health')
            .eq('id', user.id)
            .single();

        if (refreshError) {
            console.error("Error reading row after update:", refreshError.message, refreshError.code, refreshError.details);
        } else {
            console.log("Row after update:", refreshedRow);
        }
    }

    async fetchPlayerData() {
        // 1. Get the authenticated user's ID
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("User not logged in");
            return;
        }

        // 2. Fetch the specific row from your 'PlayerStats' table
        const { data, error } = await supabase
            .from('PlayerStats')        // Your table name
            .select('health, food')    // The columns you want (or '*' for all)
            .eq('id', user.id)       // Filter where the ID matches
            .single();               // We only expect one row back

        if (error) {
            console.error("Error fetching stats:", error.message);
            // Keep default values initialized in create()
        } else if (data) {
            // 3. Save it to your scene variable
            this.playerStats = data;
            console.log("Stats loaded:", this.playerStats);
        }
    }
}