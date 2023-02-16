// Get the Sidenav
var mySidenav = document.getElementById("mySidenav");
  
// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");

// Toggle between showing and hiding the sidenav, and add overlay effect
function w3_open() {
    if (mySidenav.style.display === 'block') {
        mySidenav.style.display = 'none';
        overlayBg.style.display = "none";
    } else {
        mySidenav.style.display = 'block';
        overlayBg.style.display = "block";
    }
}

// Close the sidenav with the close button
function w3_close() {
    mySidenav.style.display = "none";
    overlayBg.style.display = "none";
}

function home(){
    $("#ajin").addClass("w3-half"); // remove the css property that makes width 50%
    $("#ajin").removeClass("w3-full"); // add a css property that makes width 100%
    $("#ajun").removeClass("w3-hide"); // hide user notification area
    data_user=`<h5 class="w3-black w3-padding-left">Informações de conta</h5>
    <table id="us_conta" class="w3-table w3-black "> 
        <tbody>
          <tr>
          <td><i class="fa fa-user"></i> &emsp; Nome:</td><td><a class="info-n">gabriel</a></td>
          </tr>
          <tr>
          <td><i class="fa fa-money"></i>&emsp; Saldo:</td><td><a class="info-m">675.02</a></td>
          </tr>
          <tr>
          <td><i class="fa fa-calendar"></i> &emsp; Data:</td><td><a class="info-d">9/1/2023</a></td>
          </tr>
        </tbody>
    </table>`;
    $("#ajin").html(data_user);
    load_ops(conta);
}

function load_ops(conta){
    // Load operations and send the to user operations area
    $.ajax({
        url: "/crud_ops",
        type: 'get',
        data: {operacao:'historico_transacoes',conta:conta},
        success:function(postresult){
            var size = postresult.data.Nome_Jogos.length;
            operations_data = postresult.data;
            money_spent = postresult.data.Valor_Gasto;
            transaction_qt = postresult.data.Quantidade_transacoes; 
            evaluation_qt = postresult.data.Quantidade_Avaliacoes;
            $("#operacoes").html('<tbody><tr>')
            for (let index = 0; index < size; index++) {
                var user_info =  [];
                Object.getOwnPropertyNames(operations_data).forEach(result => {user_info.push(operations_data[result][index])})
                    //load each transaction
                    operation=`<tr>
                    <td><i class='fa fa-user w3-green w3-padding-tiny'></i></td><td>Compra `+user_info[1]+`</td><td>`+user_info[5]+`</td><td>`+user_info[0]+`</td>
                    </tr>`;
                    $("#operacoes").append(operation);
            }
            $("#operacoes").append('</tr></tbody>')
            //refresh info cubes
            loadsaldo(conta);
        }
    })
}

function loadsaldo(conta){
    //security layer test vs sql injections
    conta = parseInt(conta);

    //get all saldos
    $.get("/crud_ops",{operacao:'ler_saldo',conta:conta},function(postresult){
      //Info cubes
      $("#cash").text(postresult);
      $("#money_spent").text(money_spent);
      $("#game_count").text(transaction_qt);
      $("#rating_count").text(evaluation_qt);
      var saldo = postresult
      $(".modal_body").empty();//cleanup
      //user info
      var currentdate2 = new Date(); 
      var datenow = currentdate2.getDate() + "/" +  (currentdate2.getMonth()+1) + "/" + currentdate2.getFullYear();
      $(".info-n").text(user);
      $(".info-m").text(saldo);
      $(".info-d").text(datenow);
    });
}

function get_games(page) {
    $.ajax({
        url: "/crud_ops",
        type: 'get',
        data: {operacao:'ler_games',page:page},
        success:function(postresult){
            //save information from the database on array so we only have to request pages once
            var pages = postresult.data[1]; // infomation to generate buttons for each page needed
            games_data = postresult.data[0]; // information of every game in the page
            game_page = page;
            $("#ajin").removeClass("w3-half"); // remove the css property that makes width 50%
            $("#ajin").addClass("w3-full"); // add a css property that makes width 100%
            $("#ajun").addClass("w3-hide"); // hide user notification area
            //change header
            pages_options =`<h5 class="w3-black w3-padding-left">Lista de jogos: &emsp;<select class="page_list" onchange="get_games(this.value)">`;
            // append dynamicly generated select with page numbers
            for (let index = 0; index < pages; index++) {
            if (index == page){
                pages_options +=`<option value="`+index+`" selected>Pagina `+index+`</option>`;
            } else {
                pages_options +=`<option value="`+index+`">Pagina `+index+`</option>`;
            }
            }
            pages_options +=`</h5></select>`;
            $("#ajin").html(pages_options);
            //append each game to de ajin div with the correct style and information from the sql query
            Object.values(games_data).forEach((result,index) => {
            moda_body =`
            <div class="w3-container w3-display-container w3-black w3-cell" style="display: inline-block;width: 33%;">
            
            <img class="w3-third" src="`+result.HeaderImage+`" alt="HeaderImage" style="margin: 20px 0px;">
            <p class="w3-twothird w3-margin-top w3-padding"style="font-size: 20px;">`+result.QueryName+`</p>

            <button class="view_game w3-third w3-button w3-block w3-dark-grey w3-display-bottomright games" value=`+index+`>Ver mais</button>
            </div>`;
            $("#ajin").append(moda_body);
            })
        }
        });
}

function view_games(id) {
    $(".modal_head").text(games_data[id].QueryName);
    $(".modal_body").removeClass("w3-white");
    $(".modal_body").addClass("w3-black");
    $(".modal_subtitle").empty();
    //for loop to find genres with recurse to ternaries
    var genres = "";
    Object.getOwnPropertyNames(games_data[id]).forEach((results,index) => {
    if (index >= 10 && index < 23){
        //validate if genres are true or false and append them to a string with commas
        var genre=(index == 22 ? results : results+", ");
        genres+=(games_data[id][results] == 'TRUE' ? genre.replace('GenreIs', '') : "")
    }
    })
    moda_body=`
        <div class="w3-half w3-container w3-black" style="margin: 20px 0px;height: 350px;padding:20px 20px">
        <img class="w3-image" src="`+games_data[id].HeaderImage+`" alt="HeaderImage">
        <div class="w3-left-align">
            <p style="font-size:11px">Data de lançamento: `+games_data[id].ReleaseDate+`</p>
            <p style="font-size:11px">Preço: `+games_data[id].PriceFinal+`</p>
        </div>
        <div class="w3-left-align w3-padding-top">
            <b style="font-size:11px">Generos:</b>
            <p style="font-size:11px;word-wrap: break-word;">`+genres+`</p>
        </div>
        </div>
        <div class="w3-half w3-container w3-black w3-display-container" style="margin: 20px 0px;height: 350px;padding:20px 20px">
        <textarea class="w3-black w3-padding" style="font-size: 15px;height: 200px;overflow-y: hidden;resize: none;width: 100%;">
        `+games_data[id].DetailedDescrip+`
        </textarea>
        <div class="w3-display-bottomright w3-cell">
            <button class="w3-third w3-button w3-block w3-dark-grey w3-hover-orange games purchase" value="`+games_data[id].ID_jogos+`" style="float: right">Comprar</button>
            <button class="w3-third w3-button w3-block w3-dark-grey w3-hover-orange games comments" value="`+games_data[id].ID_jogos+`" style="float: right">Comentarios</button>
        </div>
        </div>`;
    $(".modal_body").html(moda_body);
    //Show the modal
    document.getElementById('id01').style.display='block';
}

function view_comments(id,page,conta) {
  // load own comment first (if it exists)
  $.get("/crud_ops",{operacao:'ler_game',id_user:conta,id_jogo:id},function(postresult){
      if (postresult.data.Nome != null){
        // user has game
        has_game = postresult.data.has_game;
        // save it on a variable for later use
        user_comment=`<div class="w3-padding w3-border">
        <img src="https://cdn.discordapp.com/emojis/963102728144425000.gif" alt="Avatar" class="w3-left w3-circle w3-margin-right" style="width:50px;height:50px">
        <b>`+postresult.data.Nome+`</b>
        <p>`+postresult.data.Comentarios+`</p>
        <br>
        <i class="fa fa-trash delete_comment" style="color: red;" data-game='`+id+`'></i>
        </div>`;
      }else{
        // check if user has game
        has_game = postresult.data.has_game;
        // user has no comment
        user_comment = `<div class="w3-padding w3-border">
                <p>Gostou do jogo? Deixe o seu comentário...</p>
                <button class="w3-button w3-block w3-dark-grey w3-hover-orange games insert_comment" value="`+id+`">+ Comentar</button>
                </div>`;
      }
  });
  // Load all comments
  $.ajax({
        url: "/crud_ops",
        type: 'get',
        data: {operacao:'historico_comentarios',id_game:id,page:page},
        success:function(postresult){
          data_type = typeof(postresult.data);
          if (data_type != 'number'){
            comments_data = postresult.data[0];
            user_ids = comments_data.Id_Users;
            var comment_count = postresult.data[1];
            // create comments area
            comment_body=`
            <div class="w3-container w3-light-dark" style="font-size: small;">
            <header class="w3-container w3-light-dark">
            <hr>      
            <h3>Comentarios</h3>
            </header>
            <div class="w3-container" style="height: 350px;overflow-y:hidden">`;
            comment_body+=`<p>`+comment_count+` comentarios</p>`;
            // draw our own comment allways first
            comment_body+=user_comment;
            // draw other peoples comments
            for (let index = 0; index < user_ids.length; index++) {
                var user_info =  [];
                Object.getOwnPropertyNames(comments_data).forEach(result => {user_info.push(comments_data[result][index])})
                    //load each comment and their respective data info [4] is username and info [2] is comment row
                    if (user_ids[index] != conta){
                        comment_body+=`<div class="w3-padding w3-border">
                        <img src="https://cdn.discordapp.com/emojis/963102728144425000.gif" alt="Avatar" class="w3-left w3-circle w3-margin-right" style="width:50px;height:50px">
                        <b>`+user_info[4]+`</b>
                        <p>`+user_info[2]+`</p><br>
                        </div>`;
                    }
                }
            //close the comment section
            comment_body+=`</div></div>`;
            $(".modal_body").append(comment_body);
          // if there are no comments
          }else{
            // create comments area
            comment_body=`
            <div class="w3-container w3-light-dark" style="font-size: small;">
            <header class="w3-container w3-light-dark">
            <hr>      
            <h3>Comentarios</h3>
            </header>
            <div class="w3-container" style="height: 350px;overflow-y:hidden">
            <p>0 Comentarios</p>`;
            // if you own the game
            if (has_game == true){
                console.log(typeof(has_game))
                comment_body+=`<div class="w3-padding w3-border">
                <p>Seja o primeiro a comentar</p>
                <button class="w3-button w3-block w3-dark-grey w3-hover-orange games insert_comment" value="`+id+`">+ Comentar</button>
                </div>`;
                comment_body+=`</div></div>`;
                $(".modal_body").append(comment_body);
            // if you dont own the game
            }else{
                console.log(typeof(has_game))
                comment_body+=`</div></div>`;
                $(".modal_body").append(comment_body);
            }
          }
          
        }
      });
  }
  // insert comment with the id of the game
  function insert_comment(){ 
  $.ajax({
    url: "/crud_ops",
    type: 'post',
    data: $('#insert_comment').serialize(),
    success:function(postresult){
      cdata = postresult.includes("A sua operação foi efectuada...");

      if (cdata == true){
          load_ops(conta);
          $(".w3-closebtn").click();//close modal
      }
    }
  });
  }

  //delete comment
  function delete_comment(){
  $.ajax({
      url: "/crud_ops",
      type: 'post',
      data: $('#delete_comment').serialize(),
      success:function(postresult){
          cdata = postresult.includes("A sua operação foi efectuada...");
          if (cdata == true){
              //reload values
              load_ops(conta);
              $(".w3-closebtn").click();//close modal
          }
      }
    });
  }


  // insert money
  function update_cash(){
    $.ajax({
      url: "/crud_ops",
      type: 'post',
      data: $('#update_cash').serialize(),
      success:function(postresult){
        cdata = postresult.includes("A sua operação foi efectuada...");

        if (cdata == true){
            //reload values
            loadsaldo(conta);
            $(".w3-closebtn").click();//close modal
        }
      }
    });
  }

  function buy_game(id,conta){
    $.post("/crud_ops",{operacao:'comprar_jogo',id_user:conta,id_jogo:id},function(postresult){
        cdata = postresult.includes("A sua operação foi efectuada...");
        if (cdata == true){
            alert('O jogo foi comprado')
            //reload values
            load_ops(conta);
            $(".w3-closebtn").click();//close modal
        }else{
            alert('Houve um problema na compra do seu jogo, por favor contacte o suporte')
            //reload values
            $(".w3-closebtn").click();//close modal
        }
    });
  }

//jquery & ajax
  //Loaded at the beginning
  $( document ).ready(function() {
    // <?php echo 'loadsaldo('.$conta.');'; ?>//inline php to solve sync issues
    //show table modal
    load_ops(conta);
    $(document).on("click",".clickable",function(){
      $(".modal_body").empty();
      $(".modal_subtitle").empty();
      $(".modal_head").text("");
      
    //Show the modal
    document.getElementById('id01').style.display='block';
    });

    // show games list
    $(".home").on("click",function(){ // read game list 
        home();
    });

    // show games list
    $(".store").on("click",function(){ // read game list 
      get_games(game_page);
    });

    //print reports of any part of the web page
    $(document).on("click",".pdf",function(){
      createPDF("ajun");
    });

    // logout button
    $(".terminar").on("click",function(){
      $.post("dash.php",{end:'1'},function(postresult){
        window.location.href = "Main.php";
      });
    });
  });

//functions
  //operations
  // show game
  $(document).on("click",".view_game",function(){ // read specific game 
      view_games($(this).val());
  });
  
  // read game comments
  $(document).on("click",".comments",function(){ // read specific game 
      view_comments($(this).val(),comment_page,conta)
  });

  $(document).on("click",".comment_i",function(){ // comment
      insert_comment()
  });
  
  $(document).on("click",".comment_d",function(){ //delete comment
    delete_comment();
  });

  // buy game and reload balance after purchasing
  $(document).on("click",".purchase",function(){ // buy game
    buy_game($(this).val(),conta)
  });
  
  // load money for the user and reload balance
  $(document).on("click",".insert_cash",function(){ // insert cash
    update_cash();
  });

  //impressao
  function createPDF(valor) { //print any 
        var sTable = document.getElementById(valor).innerHTML;
        var currentdate = new Date(); 
        var datetime = "Impresso dia: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " as  "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds()+ " horas ";
        var style = "<style>";
        style = style + "table {width: 100%;font: 17px Calibri;}";
        style = style + "table, th, td {border: solid 1px #fff; border-collapse: collapse;";
        style = style + "padding: 2px 3px;text-align: left;}";
        style = style + ".big{font: 24px Calibri;}";
        style = style + "</style>";

        // CREATE A WINDOW OBJECT.
        var win = window.open('', '', 'height=700,width=700');

        win.document.write('<html><head>');
        win.document.write('<title>Profile</title>');   // <title> FOR PDF HEADER.
        win.document.write(style);          // ADD STYLE INSIDE THE HEAD TAG.
        win.document.write('</head>');
        win.document.write('<body>');
        win.document.write(sTable);         // THE TABLE CONTENTS INSIDE THE BODY TAG.
        win.document.write('<br><br>');
        win.document.write(datetime); //get current time
        win.document.write('</body></html>');

        win.document.close(); 	// CLOSE THE CURRENT WINDOW.

        win.print();    // PRINT THE CONTENTS.
    }