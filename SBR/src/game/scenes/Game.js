import { Scene } from 'phaser';
import { supabase } from '../main'

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    RollDice() {
        //TODO: add dice animation when function is called, then return the result after animation is complete
        return Math.floor(Math.random() * 6) + 1;
    }

    create ()
    {
        sum = 0;

        this.UIcontainer = this.add.container(512, 384);
        this.rect = this.add.rectangle(0, 250, 1024, 300, 0x000000).setAlpha(0.5);

        this.diceContainer = this.add.container(-420, 200);
        this.dice1 = this.add.rectangle(0, 0, 80, 80, 0xffffff).setStrokeStyle(2, 0x000000);
        this.dice2 = this.add.rectangle(0, 100, 80, 80, 0xffffff).setStrokeStyle(2, 0x000000);
        this.diceContainer.add([this.dice1, this.dice2]).addListener('pointerdown', () => {
            const result1 = this.RollDice();
            const result2 = this.RollDice();
            sum = result1 + result2;
            console.log(`Rolled: ${result1} and ${result2}`);
        });

        this.UIcontainer.add(this.rect);
        this.UIcontainer.add(this.diceContainer);
    }
}
