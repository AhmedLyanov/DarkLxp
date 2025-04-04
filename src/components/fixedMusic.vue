<template>
    <div class="button_set_music" @click="toggleMusic">
        <div 
            class="button_set_music_icon"
            :class="{ 'button_set_music_icon--playing': isPlaying }"
        ></div>
    </div>
</template>

<script>
import musicFile from '../assets/audio/DarkLxp1.mp3';

export default {
    data() {
        return {
            isPlaying: false,
            audio: null,
            audioContext: null
        }
    },
    created() {
        this.audio = new Audio(musicFile);
        this.audio.loop = true
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = this.audioContext.createMediaElementSource(this.audio);
        source.connect(this.audioContext.destination);
    },
    methods: {
        async toggleMusic() {
            if (this.isPlaying) {
                await this.audio.pause();
                this.audioContext.suspend(); 
            } else {
                try {
                    if (this.audioContext.state === 'suspended') {
                        await this.audioContext.resume();
                    }
                    await this.audio.play();
                } catch (err) {
                    console.error("Ошибка воспроизведения:", err);
                    return;
                }
            }
            this.isPlaying = !this.isPlaying;
        }
    },
    beforeDestroy() {
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
</script>

<style scoped>
.button_set_music {
    width: 60px;
    height: 60px;
    position: fixed;
    right: 24px;
    bottom: 24px;
    display: grid;
    align-items: center;
    justify-items: center;
    border-radius: 50%;
    border: 1px solid #7B97FF;
    box-shadow: 0 0 10px #7B97FF; 
    z-index: 1000;
    animation: blueLightMusic 0.5s infinite, glow 2s infinite; 
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
}

.button_set_music:hover {
    transform: scale(1.05);
}

@keyframes blueLightMusic {
    from {
        box-shadow: 0 0 10px #7B97FF;
    }
    to {
        box-shadow: 0 0 20px #7B97FF; 
    }
}

@keyframes glow {
    0%, 100% {
        box-shadow: 0 0 10px #7B97FF;
    }
    50% {
        box-shadow: 0 0 20px #7B97FF; 
    }
}

.button_set_music_icon {
    width: 30px;
    height: 30px;
    background-image: url("../assets/media/music.svg");
    background-size: cover;
    background-position: center;
    cursor: pointer;
    transition: all 0.3s ease; 
    border-radius: 50%;
}

.button_set_music_icon--playing {
    animation: rotate 4s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(-360deg);
    }
}
</style>