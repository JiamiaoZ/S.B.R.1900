import Phaser from 'phaser';
import StartGame from './game/main';
import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://vpgwwkvaqbgozhfuasml.supabase.co';
const supabaseKey = 'sb_publishable_wmaOdZmOPpQBj1HUgNedvg__We1nEqW';
export const supabase = createClient(supabaseUrl, supabaseKey);

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    pixelArt: false,
    dom: {
        createContainer: true
    },
    scene: [bootScene, gameScene]
};

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load any assets needed for the boot scene here
    }

    create() {
        this.scene.start('GameScene');
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load game assets here
    }

    create() {
        // Initialize game objects and logic here
    }
}

new Phaser.Game(config);

document.addEventListener('DOMContentLoaded', () => {

    StartGame('game-container');

});