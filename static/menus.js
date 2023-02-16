// scripts for drawing modal
// the code here creates a modal acording to the option that the user selected on the nav bar
// each type of operation contains different forms that according to the class present on the button will then
// later trigger a function on crudops.js and the hidden field with the name 'operacao' signals to the endpoint what kind
// of operation we want to trigger

// user methods
// this.val brings the id from the game that is stored in the button called by the class .insert_comment
$(document).on("click",".insert_comment",function(){ // draws the modal 
      $(".modal_body").empty();
      $(".modal_subtitle").empty();
      $(".modal_subtitle").append(`
          <form id='insert_comment' class='w3-padding-16' style='margin-top:10px' method='post'> 
            <label class='w3-quarter' for='comment'>Commentario: </label>
              <br>
              <textarea class='comment w3-full' name='comment' rows='4' cols='50'></textarea>
              <br><br>
              <label for='rating'>Avaliação: </label>
              <input class='rating' type='number' value=1 min='1' max='5' name='rating'>
              &nbsp;
              <input type='hidden' name='operacao' value='inserir_comentario'/> 
              <input type='hidden' name='game' value='`+$(this).val()+`'/> 
              <input class='id_co' type='hidden' name='account' value ="`+conta+`" /> 
              <input type='button' class='comment_i' value='confirmar'/> 
          </form>`);
      $(".modal_head").text("Novo Comentario");
      //Show the modal
      document.getElementById('id01').style.display='block';
});
$(document).on("click",".delete_comment",function(){ // draws the modal
  $(".modal_body").empty();
      $(".modal_subtitle").empty();
      $(".modal_subtitle").append(`
          <form id='delete_comment' class='w3-padding-16' style='margin-top:10px' method='post'> 
              Esta prestes a apagar o comentario, têm a certeza que quer prosseguir? &nbsp;
              &nbsp;
              <input type='hidden' name='game' value='`+$(this).data('game')+`'/>
              <input type='hidden' name='operacao' value='delete_comentario'/>
              <input class='idco' type='hidden' name='conta' value ="`+conta+`" />
              <input type='button' class='comment_d' value='confirmar'/>
          </form>`);
      $(".modal_head").text("Apagar Comentario");
      //Show the modal
      document.getElementById('id01').style.display='block';
});
$(document).on("click",".update_cash",function(){ // draws the modal
  $(".modal_body").empty();
      $(".modal_subtitle").empty();
      $(".modal_subtitle").append(`
          <form id='update_cash' class='w3-padding-16' style='margin-top:10px' method='post'> 
              Dinheiro a depositar: &nbsp;
              <input class='cash' type='number' name='cash'/>
              &nbsp;
              <input type='hidden' name='operacao' value='inserir_saldo'/>
              <input type='hidden' name='conta' value ="`+conta+`" />
              <input type='button' class='insert_cash' value='confirmar'/>
          </form>`);
      $(".modal_head").text("Inserir Saldo");
      //Show the modal
      document.getElementById('id01').style.display='block';
});
// Publisher methods
$(".insert_game").on("click",function(){ // draws the modal
  $(".modal_body").empty();
      $(".modal_subtitle").empty();
      $(".modal_subtitle").append(`
          <form id='insert_game' class='w3-padding-16' style='margin-top:10px' method='post'> 
              Nome do jogo: &nbsp;
              <input class='name' type='text' name='name'/> 
              &nbsp; Descrição: &nbsp;
              <input class='rating' type='number' min='1' max='5' name='rating'/>
              &nbsp; 
              <label for="genre">Escolha os generos:</label>
              <select name="genre" id="genre" onclick="load_genres()">
              </select>
              &nbsp;
              <input type='hidden' name='operacao' value='insert_game'/>
              <input class='idco' type='hidden' name='conta' value ="`+conta+`" />
              <input type='button' class='game_i' value='confirmar'/>
          </form>`);
      $(".modal_head").text("Inserir Jogo");
      //Show the modal
      document.getElementById('id01').style.display='block';
});

$(".edit_game").on("click",function(){ // draws the modal
  $(".modal_body").empty();
      $(".modal_subtitle").empty();
      $(".modal_subtitle").append(`
          <form id='edit_game' class='w3-padding-16' style='margin-top:10px' method='post'> 
              <label for="game">Escolha um jogo:</label>
              <select name="game" id="game" onclick="load_games()">
              </select>
              &nbsp; Descrição: &nbsp;
              <input class='rating' type='number' min='1' max='5' name='rating'/>
              &nbsp; 
              <label for="genre">Escolha um genero:</label>
              <select name="genre" id="genre" onclick="load_genres()">
              </select>
              &nbsp;
              <input type='hidden' name='operacao' value='edit_game'/>
              <input class='idco' type='hidden' name='conta' value ="`+conta+`" />
              <input type='button' class='game_e' value='confirmar'/>
          </form>`);
      $(".modal_head").text("Editar Jogo");
      //Show the modal
      document.getElementById('id01').style.display='block';
});

$(".delete_game").on("click",function(){ // draws the modal
  $(".modal_body").empty();
      $(".modal_subtitle").empty();
      $(".modal_subtitle").append(`
          <form id='edit_game' class='w3-padding-16' style='margin-top:10px' method='post'> 
              <label for="game">Escolha um jogo:</label>
              <select name="game" id="game" onclick="load_games()">
              </select>
              &nbsp;
              <input type='hidden' name='operacao' value='delete_game'/>
              <input class='idco' type='hidden' name='conta' value ="`+conta+`" />
              <input type='button' class='game_e' value='confirmar'/>
          </form>`);
      $(".modal_head").text("Apagar Jogo");
      //Show the modal
      document.getElementById('id01').style.display='block';
});

$(".cancel").on("click",function(){
  $("w3-closebtn").click();
});