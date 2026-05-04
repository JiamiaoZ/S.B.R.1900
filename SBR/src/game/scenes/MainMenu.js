import { Scene } from 'phaser';
import { supabase } from '../main';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.add.image(512, 384, 'background');

        this.add.image(512, 300, 'logo');

        this.add.text(512, 460, 'Click to Start', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            //turn login invisible immediately if login is already visible
            if (this.scene.isActive('Login')) {
                this.scene.stop('Login');
            } else {
                this.scene.launch('Login');
            }

        });
    }
}

export class Login extends Scene {
    preload() {
        this.load.html('loginform', 'assets/loginform.html');
    }

    constructor() {
        super('Login');
    }

    create() {
        // Place the HTML form in the center of the screen
        const form = this.add.dom(512, 384).createFromCache('loginform');

        // Listen for the button click inside the HTML
        form.addListener('click');

        form.on('click', async (event) => {
            if (event.target.name === 'loginBtn') {
                const username = form.getChildByName('username').value;
                const password = form.getChildByName('password').value;

                if (username !== '' && password !== '') {
                    // Call your Supabase login function
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: username,
                        password: password
                    });

                    if (data.user) {
                        this.scene.start('Game');
                    } else {
                        alert("Access Denied: " + error.message);
                    }
                }
            }
        });
    }
}