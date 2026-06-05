import { Scene } from 'phaser';
import { DialogueManager } from '../systems/DialogueManager';
import { supabase } from '../main'

export class Pregame extends Scene {
    constructor() {
        super('Pregame');
    }

    async create() {
        this.playerStats = { food: 0, health: 0 };

        const loadingText = this.add.text(512, 384, 'Loading Data...', { fill: '#fff' }).setOrigin(0.5);

        await this.fetchPlayerData();

        loadingText.destroy();

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

        this.fullScreenRect = this.add.rectangle(512, 384, 1024, 768)
            .setInteractive()
            .on('pointerdown', () => {
                if (this.dialogueManager.isTyping) {
                    this.dialogueManager.fastForwardTyping();
                    return;
                }

                if (!this.choiceContainer.visible) {
                    if (this.dialogueManager.currentChoices && !this.dialogueManager.choicesShown) {
                        this.dialogueManager.showChoices(this.dialogueManager.currentChoices);
                    } else {
                        this.dialogueManager.nextLine();
                    }
                }
            });

        // Initialize the DialogueManager
        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.init({
            currentSceneData: this.currentSceneData,
            dialogText: this.dialogText,
            characterSprite: this.characterSprite,
            bgImage: this.bgImage,
            choiceContainer: this.choiceContainer,
            fullScreenRect: this.fullScreenRect,
            fullStory: this.fullStory,
            onChoiceSelected: (choice) => this.handleChoiceSelected(choice)
        });

        this.dialogueManager.nextLine();
    }

    async handleChoiceSelected(choice) {
        if (choice.server_trigger_id) {
            console.log("Updating stats with:", choice.server_trigger_id);
            await this.updatePlayerStats(choice);
        }
    }

    async updatePlayerStats(choice) {
        const { data, error } = await supabase.rpc('handle_trade', { 
            choice_id: choice.server_trigger_id 
        });

        if (error) {
            console.error("Cheating detected or server error:", error);
        } else {
            this.fetchPlayerData();
        }
    }

    /*
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
        */

    async fetchPlayerData() {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("User not logged in");
            return;
        }

        const { data, error } = await supabase
            .from('PlayerStats')
            .select('health, food')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error("Error fetching stats:", error.message);
        } else if (data) {
            this.playerStats = data;
            console.log("Stats loaded:", this.playerStats);
        }
    }
}