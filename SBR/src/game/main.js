import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vpgwwkvaqbgozhfuasml.supabase.co'
const supabaseKey = 'sb_publishable_wmaOdZmOPpQBj1HUgNedvg__We1nEqW'
export const supabase = createClient(supabaseUrl, supabaseKey)

import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Login } from './scenes/MainMenu';
import { AUTO, Game, Scale } from 'phaser';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Login,
        MainGame,
        GameOver
    ],
    	parent: 'phaser-container',
	dom: {
        createContainer: true
    },
};

const StartGame = (parent) => {

    return new Game({ ...config, parent });

}

export default StartGame;
