      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext("2d");
      var frameWidth;
      var frameHeight;
      var up = false;
      var speed = 15;
      var left = false;
      var right = false;
      var random = Math.floor(Math.random() * 3) + 1;
      var canvasWidth = window.innerWidth ;
      canvas.width = canvasWidth;
      canvas.height = 500;
      image = new Image();
      image.onload = function() {
          imageWidth = this.width;
          imageHeight = this.height;
          frameWidth = image.width / 4;
          frameHeight = image.height / 4;
      };
      image.src = "https://i.imgur.com/OButbqG.png?1";
      var current_state = 'right';
      var current_frame = 0;
      var hero = {
          position: {x: 100, y: 380}
      };
   
      var animations = {
          down: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}],
          left: [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}],
          right: [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}],
          up: [{x: 0, y: 3}, {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}]
      };

      setInterval(function(){
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, animations[current_state][current_frame].x * frameWidth, animations[current_state][current_frame].y * frameHeight, 
            frameWidth, frameHeight, hero.position.x, hero.position.y, frameWidth, frameHeight);
          current_frame += 1;
          if (random == 1) {
            ctx.drawImage(enemy, Math.floor())
          }
          if (current_frame > 3) {
              current_frame = 0;
          }
      }, 1000 / 10);

      document.addEventListener('keydown', function(e){
          
          switch(e.keyCode) {
              case 39:
                  right = true;
                  current_state = 'right';
                  hero.position.x += 4;
                  break;
              case 37:
                  left = true;
                  current_state = 'left';
                  hero.position.x -= 4;
                  left = true;
                  break;
              case 38: 
                  if (right === true) {
                    current_state = 'right';
                    hero.position.y -= speed * 4;
                  }
                  if (left === true) {
                    current_state = 'left';
                    hero.position.y -= speed * 0.75;
                  }
                  break;
              case 40:
                  current_state = 'down';
                  hero.position.y += 2;
                  break;
          }
      });
      document.addEventListener('keyup', function(e){
          switch(e.keyCode) {
            case 38:
                if (right === true) {
                  current_state = 'right';
                  hero.position.y += speed * 4;
                  right = false;
                }
                if (left === true) {
                  current_state = 'left';
                  hero.position.y += speed * 0.75;
                  left = false;
                }
              break 
            
          }
      });
