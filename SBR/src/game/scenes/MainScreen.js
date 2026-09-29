import { Scene } from 'phaser';
import { supabase } from '../main';

export class MainScreen extends Scene
{   
    constructor ()
    {
        super('MainScreen');
    }

    create ()
    {
        this.add.image(512, 384, 'background').setDisplaySize(1024, 768);

        const logo = this.add.image(512, 384, 'logo').setScale(0.3);

        const drought = this.add.image(2000, 384, 'drought').setScale(1).setBelow(logo);
        
        let active = false;

        this.input.on('pointerdown', () => {

            if (active) {
                this.tweens.add({
                    targets: logo,
                    x: 512,
                    y: 384,
                    scale: 0.3,
                    duration: 1000,
                    ease: 'Power2'
                })
                this.tweens.add({
                    targets: this.scene.get('Login').children.list[0],
                    x: 1500,
                    duration: 1000,
                    ease: 'Power2'
                })
                this.tweens.add({
                    targets: drought,
                    x: 2000,
                    duration: 1000,
                    ease: 'Power2'
                })
                active = false;
            } else {
                this.tweens.add({
                    targets: logo,
                    x: 250,
                    duration: 1000,
                    ease: 'Power2'
                })
                this.tweens.add({
                    targets: drought,
                    x: 1500,
                    duration: 1000,
                    ease: 'Power2'
                })
                this.scene.launch('Login');
                active = true;
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
        const form = this.add.dom(1500, 384).createFromCache('loginform');

        this.tweens.add({
            targets: form,
            x: 700,
            duration: 1000,
            ease: 'Power2'
        });

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
                        this.scene.start('MainMenu');
                    } else {
                        alert("Access Denied: " + error.message);
                    }
                }
            }
        });
    }
}