import { Scene } from 'phaser';
import { supabase } from '../main';

//TODO: build stage unlock time based on real date

function MakeStageText(scene, stageNumber, x, y) {
    const container = scene.add.container(x, y);
    const circle = scene.add.circle(0, 0, 60, 0x000000);
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
        } else {
            this.statBtn.setText("VIEW STATS");
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

        const box = this.add.rectangle(0, 0, 300, 400, 0x111111).setStrokeStyle(2, 0x00ff00);
        const title = this.add.text(-130, -180, "PLAYER STATUS", { font: 'bold 20px monospace', fill: '#0f0' });

        this.healthText = this.add.text(-130, -120, "Health: 100", { fill: '#fff' });
        this.foodText = this.add.text(-130, -90, "Food: 50", { fill: '#fff' });

        // Note: Backdrop is added first so it stays behind the text/box
        this.statWindow.add([backdrop, box, title, this.healthText, this.foodText]);
    }

}
