import { Scene } from 'phaser';
import { supabase } from '../main';

//TODO: build stage unlock time based on real date

function MakeStageText(scene, stageNumber, x, y) {
    const container = scene.add.container(x, y);
    const circle = scene.add.circle(0, 0, 60, 0x000000);
    circle.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        if (stageNumber === 0) {
            scene.scene.start('Pregame', { stage: stageNumber, status: 'pregame'});
        }
    });
    const text = scene.add.text(0, 0, `STAGE ${stageNumber}`, { fontSize: '22px', fill: 'rgb(255, 0, 0)' });
    text.setOrigin(0.5, 0.5);
    container.add([circle, text]);
    return container;
}

export class MainMenu extends Scene {
    constructor ()
    {
        super('MainMenu');
    }

    toggleStats(show) {
        this.statWindow.setVisible(show);

        if (show) {
            this.statBtn.setText("CLOSE STATS");
            this.fetchPlayerData();
        } else {
            this.statBtn.setText("VIEW STATS");
        }
    }

    async fetchPlayerData() {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("No user logged in!");
            return;
        }

        const { data, error } = await supabase
            .from('PlayerStats')
            .select('char_name, health, food, strength, intelligence, luck, power, speed, range, stamina, precision, potential, hours')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error("Error fetching stats:", error.message);
        } else if (data) {
            this.healthText.setText(`Health: ${data.health}`);
            this.foodText.setText(`Food: ${data.food}`);
            this.strengthText.setText(`Strength: ${data.strength}`);
            this.intelligenceText.setText(`Intelligence: ${data.intelligence}`);
            this.luckText.setText(`Luck: ${data.luck}`);
            this.powerText.setText(`Power: ${data.power}`);
            this.speedText.setText(`Speed: ${data.speed}`);
            this.rangeText.setText(`Range: ${data.range}`);
            this.staminaText.setText(`Stamina: ${data.stamina}`);
            this.precisionText.setText(`Precision: ${data.precision}`);
            this.potentialText.setText(`Potential: ${data.potential}`);
            this.hoursText.setText(`Hours: ${data.hours}`);
        }
    }

    create () {
        this.add.image(512, 384, 'background');

        this.add.image(512, 200, 'logo');

        for (let i = 0; i < 7; i++) {
            MakeStageText(this, i, 90 + i * 140, 384);
        }
        
        
        this.statBtn = this.add.text(70, 700, 'VIEW STATS', { 
            fill: '#0f0', 
            backgroundColor: '#000', 
            fontSize: '32px',
            padding: { x: 10, y: 5 } 
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.toggleStats(true));

        this.statWindow = this.add.container(512, 384).setDepth(100).setVisible(false);

        const backdrop = this.add.rectangle(0, 0, 1024, 768, 0x000000, 0.5)
            .setInteractive()
            .on('pointerdown', () => this.toggleStats(false));

        const box = this.add.rectangle(0, 0, 300, 500, 0x111111).setStrokeStyle(2, 0x00ff00);
        const title = this.add.text(-120, -200, "PLAYER STATUS", { font: 'bold 20px monospace', fill: '#0f0' });

        this.healthText = this.add.text(-130, -140, "Health: ", { fill: '#fff' });
        this.foodText = this.add.text(-130, -110, "Food: ", { fill: '#fff' });
        this.strengthText = this.add.text(-130, -90, "Strength: ", { fill: '#fff' });
        this.intelligenceText = this.add.text(-130, -60, "Intelligence: ", { fill: '#fff' });
        this.luckText = this.add.text(-130, -30, "Luck: ", { fill: '#fff' });
        this.powerText = this.add.text(-130, 0, "Power: ", { fill: '#fff' });
        this.speedText = this.add.text(-130, 30, "Speed: ", { fill: '#fff' });
        this.rangeText = this.add.text(-130, 60, "Range: ", { fill: '#fff' });
        this.staminaText = this.add.text(-130, 90, "Stamina: ", { fill: '#fff' });
        this.precisionText = this.add.text(-130, 120, "Precision: ", { fill: '#fff' });
        this.potentialText = this.add.text(-130, 150, "Potential: ", { fill: '#fff' });
        this.hoursText = this.add.text(-130, 180, "Hours: ", { fill: '#fff' });

        // Note: Backdrop is added first so it stays behind the text/box
        this.statWindow.add([backdrop, box, title, this.healthText, this.foodText, this.strengthText, 
            this.intelligenceText, this.luckText, this.powerText, this.speedText, this.rangeText, 
            this.staminaText, this.precisionText, this.potentialText,	this.hoursText]);
    }

}
