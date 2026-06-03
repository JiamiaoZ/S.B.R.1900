import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables not set. See .env.example');
}

export const supabase = createClient(supabaseUrl, supabaseKey)

import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainScreen } from './scenes/MainScreen';
import { MainMenu } from './scenes/MainMenu';
import { Pregame } from './scenes/Pregame';
import { Preloader } from './scenes/Preloader';
import { Login } from './scenes/MainScreen';
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
        MainScreen,
        Login,
        MainMenu,
        Pregame,
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
