// Espera o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('bg-music');
    audio.volume = 0.5; // Volume padrão (0.5 = 50%)
    
    // Tenta reproduzir automaticamente (pode ser bloqueado)
    const playAudio = () => {
        audio.play().catch(e => {
            console.log("Autoplay bloqueado. Aguardando interação...");
        });
    };
    
    // Inicia ao clicar em qualquer lugar da página
    document.body.addEventListener('click', function() {
        playAudio();
    }, { once: true }); // Remove o listener após o primeiro clique
    
    // Opcional: Botão de play/pause personalizado
    const createMusicButton = () => {
        const btn = document.createElement('button');
        btn.innerHTML = '🔊 Tocar Música';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = '1000';
        btn.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                btn.innerHTML = '🔇 Pausar';
            } else {
                audio.pause();
                btn.innerHTML = '🔊 Tocar';
            }
        });
        document.body.appendChild(btn);
    };
    
    createMusicButton(); // Chama a função para criar o botão
});