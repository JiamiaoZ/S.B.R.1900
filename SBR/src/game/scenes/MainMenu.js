import { Scene } from 'phaser';

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

    create () {
        this.add.image(512, 384, 'background');

        this.add.image(512, 200, 'logo');

        for (let i = 0; i < 7; i++) {
            MakeStageText(this, i, 90 + i * 140, 384);
        }
    }
}