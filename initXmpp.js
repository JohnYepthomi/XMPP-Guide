function initXmpp(credentials, successCallback, failureCallback){
    const xmpp = client({
        service: "wss://localhost:5443/ws",
        username: credentials.username,
        password: credentials.password,
    });

    xmpp.on("error", (err) => {
        failureCallback();
        xmpp.stop();
    });
    
    xmpp.on("offline", () => {
        onOffline();
    });
    
    xmpp.on("status", (status) => {
        console.debug(status);
    });

    xmpp.on("stanza", async (stanza) => {
        console.log({stanza});

        if (stanza.is("message")) {
            let from = stanza.attrs.from;
            // if(!from.includes('peter@localhost')){
                messageAccumulator(stanza);
                viewNavigator('conversationView', {senderJID: from, newMessage: stanza.getChildText('body')});
            // }
        }
    });

    xmpp.on("online", async (address) => {
        xmpp.send(xml("presence", {type: 'available'}));
        onOnline(address, xmpp);
        window.xmppObj = xmpp;
        successCallback();
    });
    
    xmpp.start().catch(console.error);
}

function isError(errorstring){
    if(errorstring.includes('Too many (20) failed authentications from this IP address')){
        console.log('Too many failed authentications from this IP address');
        xmpp.stop();
        return true;
    }else if(errorstring.includes('SASLError: not-authorized - Invalid username or password')){
        console.log('Invalid username or password');
        xmpp.stop();
        return true;
    }else{
        return false;
    }
}


let base64Avatar = 
    `/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAggICAgICAgICAgICAcHCAgICAgHBwgHBwcHBwgHBwgHBwcHBwcHBwcHBwoHBwcICQkJBwcLDAoIDAcICQgBAwQEBgUGCAYGCA0NDA0NDQwNDQgNDA0MCAgICAwICAgMCA0NCAgICAgICAgICA0ICAgICAgICAgICAgICAgICP/AABEIAZABkAMBIgACEQEDEQH/xAAdAAADAQACAwEAAAAAAAAAAAAAAgMBBQYECAkH/8QAVhAAAgECAwALBg4QBQQDAAAAAAECAwQFERIGBwghMUFRUqG00RNhcXSRkgkUFSIlNVNVYnKBsbPwIyQmMjM0VHWTlKKywdPV4Rc2QnOCGBlD8USjwv/EABsBAQEBAAMBAQAAAAAAAAAAAAABAgMFBgQH/8QAOxEAAgECAAkKBAUFAQEAAAAAAAECAxEEBSExUWFxkbESEzIzQVJygaHBNLLR8BQVIlOSQmKCwuEkI//aAAwDAQACEQMRAD8A+qZ1jbG2y7HCbWd7iFxC2t4NR1zzcp1JJuNKjTgpVK1aajJxpUoSm1GTyyi2jbL2xrXCbG5xC9m4W9tT1z0pSqTk2oU6NKLcVOtWqShSpxcopznFNxWbXx428tvK+2Q30ry8bjCOuNnZxk5ULKhJr1lPejrr1FGLrXLipVZRjvQhTpUqfa4BgEsJld5IrO9Opa9Ojcn8mEYQqS1/eX7znsHtw+iT4ldSlSwWjHDbfgjdXEKdziFRZ70o0p90s7ZNZp05Qu5cDU4POK9ZNke2pit45O7xTELnU23GteV5Uk3w6KPdFRpr4NOnGPeOsxgPpPaUcFpUlaEFt7X55/Y6SdWculL72GKBqQyRqR9hw3MSNSGURlEEFURshlEbIARRGURsjdIApuQ2RukEuLpN0jZG5AlxUg0j6BtAIT0hkU0G5AE8gyKgkAT0m6CmRmQAmgzQUyNyAJ6A0D5BkAT0mZFshQCeRmkqGkAjpDSV0BoAItGOJXSY0C3JaQyKZGZAXJ5GaSjRjiCknEVxKtBkCkGjGiriY4gEmhciriLkAdi2O7aWK2bTtMUxC20tNQo3leFJtcGuj3TuNRfBqU5R7x7M7T3ok+JWso0saoxxK3zylc28KdtiFNZ785Uodzs7lJZJU4QtJLfbnN5RfqE4maT462CUqytOCevt3rKc8K04Zn9Nx9wtrnbLscWtYXuH3NO5t5tx1wzUoVEk5Uq1OajUo1oKUXKlVhGaUotrKSb7OfFPaO2777Y9fRvbKTlTlojeWcpONC9oRb9ZPekoV6alN0blRcqUpPenTqVaVT7C7Wm2Na4tY22IWU3O3uaeuGpJThJNwqUasU5KFajUjOlUipSSnCSTksm/F4dgMsGd1li8z0PQ9ejse9Lu8Hrqqsuf7y/eY+fnok23BK6xKjgtKWVvhsadzcriqYhc0tdKMlxq2s6kJwa4ZXlVNesjl6fRidp20tkTvMVxO7bcvTOIXteLbzapTuKncYZ8lOj3OnH4MUdaSPaYJRVKlCC0ZfE8re86StPlzb+7dhiQyRqQyR9hwGKIyiaojJAGKI2RpuQIZkbpGyNSBLmJG6RlEZRBBNIygObkAKogOoDaQCeQyiPkakAJoN0DqJqiATyNyKaA0lsS5PIFErpDIWFyekNJTIMhYXJ6Q0lMgyAuSyMyLaTHEWFyWQaCugSbSy77SS4228kkuNt5JJcYFyegxo9jtqTcJ43iajVuVHCbaWTUruEp3so7+/CyjKnOG+smrurbyWakoTTPbTYBuBNj1moyr0a2JVlk9d9VcqWeW+lbUFRtpU299Rr060kslre+31NfGdCjkvd6IZfXIvVvUfbTwSpPLay1/TP6Hy3VzHUoppybyUV66TfIorNt95I7Vh+1Zi1aOqjhGK1ovgnSw29qQ86Fu49J9ldjWw2zsodzs7W2tKfMtqFK3h5tGEI9BzJ1M8eP+mnvftb3PsWL9Mty++B8Zobn7Hms1gmK/LY14vySgn0CVdoDHlw4Ji3yWFxL92mz7OAcX55U7i9Tf5fHvM+LFTaUxxPJ4HjXyYVfyXljbNdJx97tZYpT/CYVilL/AHMOvaf79vE+24FWPJ/trex+Xx7zPhLiFOVL8NCdH/dhKl+/GJ41O9g+CcX4Gn/E+8RwGObX1hdZ+mbGzuc+Hu9tRrZ+HulOWZzRx6u2lul7W9zDxe+yfp/0+IKkZkfYLHdyNsZuFlPBLCGfHbUVYy8OqydvLPv55n5tsk9Dg2O1vwDxCx5Fb3jrR+X1Qp3sms+JST5Gj6oY6oPpRktzXG/ocTwGoszX35HzEcRXE93NmHoYV3FOWH4vQrb/AK2lfW07fJfCubadxqfgs49O96YYrhsqNWtRk4udCtWoTcJaqbnRqSpSdOWUdUHKLcZaVmmnkuA7WhhVKv1cr6c6tvsfJUpTp9JHgaRWiziI4n1HETPb/wBDa24JWuJVsFqy+18RjUubWL/8eIW1LVVjFcCVzZ05Tm296VnSSWdSTfqE0dm2rNkLs8Vwy7TcfS2IWVeTTybpQuKfdoZ8lSi6lN/Bkz5MLoqtSnB9qybVlXr6HNRnyJp/du30OspDJGqIyifWcJiiOompG5AGDJG5DZAlzMjUhlEdRBkRRHUTUhlEAXIZRGSGSAF0mpD6Bsi2JcRRNUB8g0lJczSA2QyiCCZBpKaQ0lBPSbpKZG6SWBPSGkppDQUE8g0lNAaACeQaSmgNABLSGkrpOwbXu19d4re0bCygp3FdvflmqVGlHLulzXkk9FCjF5yaTlJuMIRnOpCEsykopuTslnv2JFSbyITa82uL3FruFjh9F1q81qk29NGhSTSlcXNTJqlRhms5ZOUpOMIRqTnCEvpTueNyBh+BxhXqKN7ieWcryrFaaLaycLGk9St4JZx7r66vNSnqmoyVOHddovaLs8As1a2q11J6Z3V1OKVa6rpNa55Z6KcM2qVBScaUW9+UpVJz/RzwuH4zlXbhTdoestb1aFvy5vQ4NgiprlSyvh/3XuAAA6M7EAAAAAAAAAAAAAAAAAAOJ2W7IY2lrc3c/vLW3r3M+L1lClOrLf4vWwZ8M7TU4xcm5Sazk3wuT35SffbbZ9ed2bsjdrsYxia4attGy8KxCvSsZfs3Em+8nyHyNUT2GI4Wp1J6Wl/FX/2Okw+X6orVxf8AwQVxKtCtHpTrCTiI4lmhWgU1RGRoyBDFEZI1IZRBDEh1A3IZIEMSGUBoxGUQBchlEZRGLYlxVAbI1IdRKZESN0j6TUigXSakPpBIAVI3SNkbkAKkaNGJugEuIgyKaQyAuTyDIrkGQFyekNJTIMgQnpMyK5BkBchUnks+hb7feSXC3yI+o25B3PUcEw9Va8F6p3sYVbuT35UYNaqVjB8EY0E/smlvXXdR6pRjRUPTLcY7VyxPHaEqkc7fDo+qNZNPTKrTnGNpSb4m7hq4ylvShbVIvhPqSeTx1hTyUIvXL/Ve78tB3eL6Oeo9i937bwAAPJndAAAAAAAAAAAAAAAAAAAAAAHqP6JVsh7ngtpbKWTusSo6o8tC3t7mtJ/8a6tvL3j5wuB7oeia7IVO+wi0T36FreXc1nwq7rUaNNtd70nWSfwpHpm0e+xVDk4NDXd+tl6JHnMMleq/Jel+LItCtFnERxO3PiItGNFGhWgauahkjUh4xBkFEY1IZRAMjEdI1IdRKS5igMomo1RKQxIZRGURsikFURtJqRuQBmRuQyiNpBLiaRlEbIZRBBFEZIdQGUACWk1RK6TcgCagaoD5GpAgmgNA+kNJbATQbpG0hpFgJoDQPpMqbyb7wsLn0E9Dr2FKjhN1fSjlO/vJRhLnWtinQpr/AI3Ur3f7/eeftefmW5m2OK12P4RSS0t2FvXmuSrdwV1VT7/da09/jP00/MsMqc5XqS1vcsi9Ej12Dx5NOK1eryv1AAA+M+gAAAAAAAAAAAAAAAAw0AAAwA+WG7t2Qu42T3keFWdvY2UXwrLuHp1pZclS9mnyNM/AWjue3Fsg9N4xi1zq1Rq4lfOnLlowuJ06P/0wpnT3E/TsGp8ilCOiK32y+p5OrLlTk9b4kZRFKtCuJznGRlERosJKIA0YjJAkOkACQ6iEYjlRGCRqRqQ6RoyYkMkaomgAkaakOoglxVEZRGSGUAQVIZQKKJqQIKoG5DaTUigU3SMkMoggmk3IdRG0i4uTSDSV0m5AhFRN0Fcg0iwJaA0FdIaRYEtB4+IQfc55b70tJd9reXlPN0nn7H7Lulza02vwl1a0/knXpxfzkeRXKlc+yGGYfGlSp0ob0aUIU4/FpxUV0JHlAB+TntwAAAAAAAAAAAPxzb93UOH4BBQq6rm+qR10rGjKKquO+lVuJvONtQclpU5KU5eu7nTq9zqae7bbGz+GFYbeYhUSkrWhOrGDelVKzyhRo57+Xdq8qdJPLecz5DY9j1e7r1ru6qOtc3NSVatVlwynLLeiuCFOEVGEKcUo04RhCKSiku8xZgCwluc+itH9Tz2v2JLP25VbSuuwzCnSSjHO9PYtP0P2nZ3u5NkN5KXca9HDaLzSp2lKE6ji3vKpcXUa1RzXB3S3jb55ferfz/Kb/bXxeq26uL4rUzeeUsRvNGfegq6hH/jFHXXARwPZ08GpU1aMIryXHO/NnQSqzlnk9/tmOYobYWJQecMTxKDXA4YhdwfyONdNHYMH3Q2P27zpY1iOa93uZ3i8l56Yi/lR0RoWUTkdKEs8U9qRlTkszfkz2A2ObvTZJQ/CVrO9XH6as4wll3nYTsop99wklyM/XNjHolsWnG9wmpCSg9NSzuIV4yqZPTqo3EbV06erJPK4qySzazeSPSBoxo+Kpi3Bp56aXhycLL0PpjhVWOaW/Lxyni21JqKTebyWp8blxt99vfHyKtCuJ2R8pJoTIs0K0QqIyQjRVoVxMmjUh4IyMShUiNmJDJGpDJFMgkNFGpGpFAJDxiakMkDNzEhoxGjAdIAxRGNSGQJcXIbI1RHUQZE0jKI6iNpLYCaBlEfQMolsCaiaoj5DZFBNQN0lNJugAnpDIppNVMAlkbpK6Pr9UGj65/2AI5HP7XlPPEsNXLiWGry3tBHDOH1+qOwbXEPZPDPznhnXqBx1OjLY+BqOdH1+AAPyg9sAAAAAAAAAAAevW7yrtbG7mK4J3OHxkuVK8o1EvPpxfyHzTcT6U7vRfc7W8asOswPm3Kme5xJ8O/E/lR5rGPW+S4sjkZkUaFyPQHXEnARxLtCuJAQaEcS8oE2CkhWiriI0DRNoRos0I0ASElEq0K0QpqGSBIZIpDVEZIEhkgAUR0jUh4xBkyMSkYmqJqABDJGpDKIMmKIygMojpFsQVIZIZRGyKBVAZIbSPGBQJpG0FFAZRBLk1AaMSiQZAgiiaojqJqgBcTSGRRQN0ghLIMiukNIBLI7DtcL2Twz85Yb12gcHpOwbXK9ksM/OWG9doHHU6Etj4G450fXQAA/KD3AAAAAAAAAAAB687vBfc7X8aseswPm64n0j3d6+52t41Y9YgfODI93iT4d+J8Eeaxh1vkuLIuIjiXcRGjvrHWEGhXEtKIjQBNoSUSrQpDRBoRxPIlEm4gpBoxoq0TaBUxNJOUSzQjBQSHSBIZIAEiiRkUUjEGQjEpFAkMkCAkMgSHjEGQjEdRNSHUSpAxRHUTUh4xNAVIdRHjEdIEuJGIyiMkMogguRugokaoggiiMojqI2kAnpNUSqibkASUTdBQ7Vgu1PitzShXt8OvK9Gom4VaVCU6c1GTg9MlvPKUWvCmYlOMVeTS2uxpJyyJX2HUdAaDvf+BeN+9GIfq0+wP8AAvG/ejEP1afYcfP0+/HejXNz7r3M6JoOwbXUPZLDfzlhvXaBzf8AgXjfvRiH6tPsOc2CbSmMwv8AD6k8Kv4Qp39hUnOVvNRhTp3dGc5yeW9GMU5N8STOOpXp8mX645n2rQbjTndfpe5n04AAPy89oAAAAAAAAAAAeve7sX3PVvGrHrED5xuJ9MN2RsYubzA6tC1oVbms7izkqVGDqVHGFeMpNRjv5RSzb4keh3+A2Oe8+I/q0+w9viapCODtSkl+p52u7E85jCMnVuot5FmWtn580K4n6A9oXHPefEf1afYI9oTHPefEf1ap2He8/T78d6Ou5ufde5n584iyR+gvaDx33nxH9Wqdgj2gsd958R/Vp9g5+l34719Rzc+69zPz5xEaP0J7QWO+82I/qtTsEltAY77zYj+rVOwzz9Pvx3r6l5ufde5n56K4nnYrhVWhUqUa1OdKtSk6dSnUWmpTnHecZxe+pLjR4bRzZ8qMZiLiI0XkickCkGjGiskTaBQSKRRkYjxQIzYxKpGRQ6QICQyQJFIxBkIxHSCKKRiasAUR0giikYlBkIlFEZRNSBm5iQ6iMkOoggqiMojKA6QAqiMompDKAI2KbkNoHUC2M8omoG6CqgaoFMklA+k25F/y7hvxLnrtyfODQfSDckL7nsN+Jc9duTzePuoj418sjuMV9bLw+6P2AAA8MeoAAAAAAAAAAAAAAAAAADDQAAAAAAAAAMDI0AD4/bb1zrxjGJ556sWxTJ/BV9XjH9lI6g4nIYtiHdq1et7tXr1v0tadT/8AR4Uon6rBcmKWpeiPEyd2395SLQsolWhGjYINCSReUSbQKYisIkKVdce99frwnkxJcDIZGIpGJTJsUOkCQ8YlSIbGI6QJFYxNAIxKJAkMogyCRRRCKKRiCGKI8YmpGpAAbGI6iPGJbGGxVEZQHUB1EpkRQGURkhlAARI1IppNyBLk9J9HdyUvuew34lz125PnPpPo1uTV9z2HfEueu3J5vH3UR8a+WR3OKn/9X4f9kfroAB4Y9QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeHjGIKlRq1XwUqdSq/BCDk+hHmHStu2+dLBcXqrhp4XiVReGFnWkvmNwjypJaWlvZmTsmz5C4dSypwXJCK8iRaSHpwySXIkZJH6wzxKIyiTaLyiTcTAJMnOJWSIVLheEM2jwkPBtcG94DENFGEc55FO5fh6Pr5DyadyvB4f7HhRRRI0mcbijkoNPgefgKpHGRLwuJLj8u/8A36TVzDgcjCBRI8SF7yryPt7TyIXUXx5eFfVdJbnG0yyiUjEKe/wPPwb5SMSmQjEokYkOkCN2MiikYmxiUjE0cZkYDpGpDxiALpHURkhlEEuKojKJRUxkgQRUzVTHyNUABEj6LblD/L+HfEuOuXB87VA+ie5RX3P4d8S465cHnMfdRHxr5ZHcYq62XhfzI/WgADwp6oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/K91LiHctj2LS51nUo/rDjQy+XumR+qH4Ru4L7Rsav8AlnUw6Ee/niVpKS8yMj6sEV69Nf3R+ZHBXdqc9j4HzWcCcu+Qq3Mnx5eD++bPHmfp9zyKiWncxXf8H98jxal0+JJdL7AkibRlm1FEqjb4SbRWSEaMnIjEh0jIopFAM1FIoWKKJGkZGSHijIookUjZqQyiCQ6QMmxR5FOtJcb+f5yUUUSNEZ5ML2XHk+gvTvuVdP8A6PCiikYlONxTORheR768K7My8a0eJry5fPvnFRRWMTRjko5eER0jh4wLwm1xvyvtBlw1nKxpjpHGRupcvzfxRWN7Jcnk7MgZ5DPPUR1A8GOIvkXT2lFiL5q8v9jVjPJZ5qiaoHjLE1zen+yHWJLkfR2opnks8juZ7RbTW6xsMMwy1sa1riFSpQjVUp0adq6T116tVaHUvaU2lGok9VOO+n3m/VeOJx5H0dpqxKPwvIu0+TCcFp4TFQqXsnfI7ZbNe59FCrUoycoZ7Wy6L39j3ce7rwv8ixT9FZf1Ez/rswv8ixT9FZf1E9JXiEfheRdoen4/C8ke0638lwXQ97Pt/McI1bj3b/668L/IsU/RWX9RPLwbdsYbXrUaEbPE4yr1qNvBzpWagp16kaUXNxxCUlFSmm3GMnlnknwHox6pR5JeRdpzmwLEY+qGHLKW/iGHri47yj3zE8TYMotpPM+3UajjGu2lk3H1ONAD8/PWAAAAAAAAAAAHTdtrbSoYNZSvrmnXq0oVKVJwt405VdVaahFpVq1CGlN7/wBkzy4Ez8Pn6IVhC/8Ag4s/BRsf44kjsW7l/wAv1vGbHrED52yR6rFeLqOEUXOonflNZH2JJ+50uF4VUpVOTHNZPe39D3t/7h+EfkGMfobD+qC/9xLCPyDGP0Nh/VD0PcRJI7b8mwbQ958n4+rpW498v+4phH5BjH6HD/6oK/RFcH978Y/Q4f8A1Q9C2hGifk2DaHvH4+rpW499X6Ixg/vfjH6HD/6ofk+6a3XdjjeGekbS1xCjUdzb1pTuqdrCk6VFzk4p0L24nrc9DScEsk99ZJP1elEm0bp4roU5qcU7p3WXtRJ4ZUknF2y6iUkTkizQkkdsfGiLROSLSQjQNEZE2irQkkYKhUikULFFIlIPFDxMSHSNAZIpFCpDpAyNEpGIsUUjE0iDJDpGRKRiUybFDxiEUVjEqI2aojxiZGJSMSmTUhkjUimWRSGacjUgUSmRogsYjoEiiiCCKI0YFFEaMQZ5RNRG0lFE1RLYlyWk1wK6Q0ixLsjpOe2v4+yOHfnHDuuUTh9JzmwCHsjh35xw/rlE46i/RLY+BuDfKW0+qoAB+RHvAAAAAAAAAAAD8B3cf+X63jNj1iB87mj6Jbt//L9bxmx6zA+eMke9xH8M/E/lieaxj1vkuLISiSkeQ0TlE9AdaePJE5Iu0TkjJojJE5IuyUkQqItCNFWibRkpKSEaKyJtA0iUkTkizJNEZTIlICpDxCA8SkUJFFIlIx4jxFSHQMjxRVIWCHSNkYyRSKMih4oEHiiiRkUUijRgaKHSMSKRRQajYoIookaMgh4xCMSqiCN2FjEooGqJRRNWONu4sYjKI6iMoggiiaoD6TVEpBNAaCugNAFyOg5zYBD2Rw7844f1yicQ4HObAY+yOHfnDD+uUTiqdCWx8DcH+pbT6mAYjT8hPfAAAAAAAAAAAH4Hu317AVvGbHrED55tH0N3bntBW8ZsusQPnrOJ73Efwz8b+WJ5nGPXeS4shJE2izRNo9AdaQkici8kSaIzSItE5FpIm0QpCaJyLzRJoyzRJk5Iq0I0QqIsnJFWJIGhIlYiQKRAHgUQkUUiDLGiUghUikEVEHiUihUPFGjJSKKQEiWiVGWNFFYISKKpFINCI6RiGjE0jLGjAeMRUi0YlIbGJWKMSKRRpHG3c1IdRBIdRKQxRHUTYxHUQZFURkhlEdQAJKJuksohoLlBDSc3sDj7IYd+cMP65ROK0nNbBIeyGH/nCw63ROKr0JbHwNQ6S2rifUJGgB+QH6AAAAAAAAAAAAfgm7cXsBW8ZsusQPntkfQrdte0Fbxmy6xA+e0ke+xF8M/G/lieYxj13kuLJyROSLTRNnfnXEGiUkXkiU0ARkSkizJyMmyTRGRdolNENIkybKyJsyCTJtFZk5A2LEpESJSIA8SiERRAwMi0UTiViaA6KREiUiUyUiiqQkEURowUgikELEpFAGlYonEojZgeCLRiJTRWKBmTGiiqQqiUibMDRRRRFiiqRSAolIxCMSiQMmKIyRoFMgAAAYc3sFX2/h/j9h1uicKc1sF/H8P/ADhYdbonHU6Etj4G4dJbT6fAAH48foQAAAAAAAAAAB+C7tr2greM2XWIHz5mz6D7tj2greM2XWIHz5Pf4i+GfjfyxPMYx67yXFkkybRVsSZ37OtRGZKSLyRJkKQkSki0kTkRmkRkTmirRORDSItE5FWibMspKSJyKskyGkYh4oRDxAZWI8REUiDJSBVE4opE2RlEVROBSKCIViikEJFFYGjBRFEiaKNFRGPApFCRZSmjRkrFFYonBFoI0jjY8SkRIFYlRljxKQQkUWgikHSGMNKYAAAAAAAAOa2C/j+H+P2HW6JwpzWwX8fw/wAfsOt0TjqdCWx8DcOktp9PgAD8eP0IAAAAAAAAAAA/B92uvYGt4zZdYifPk+g27W9oa3jNl1iJ8+pI9/iL4Z+N/LE8xjHrvJcWSmJJFKgjPQM6xEmRki8iMjJolMjIvJEmRlRGRORRk2Q0SkTZWZKRlmiTEkUkTZCoRFIomisAVlIlKMG3kk2+RLN9B5uD4M6nrnvQzyz45NcKXe4m/Jx5dqtbeMFlFKK738Xwt99nHKdjcafKynWqOB1X/oy8Moro1Z9BdbH6vNXnR7Ts0CsEZ5xm3TR1iOAVeavOj2lY4BV5q86PadmRUqqMzzcdZ1qOAVeavOj2lIYDV5q86PadlgUgXnGZ5tHW4YDV5q86PaP6g1eavOj2nZoDo0qjI6aOtxwCrzV50e0pDY/V5q86PadniUgadRozzaOtRwGrzV50e0rDAavNXnR7TskCkDXOMy6UdZ1xYFV5q86PaVjgNXmrzl2nY0ViXlszzSOuU8Bq81edHtKxwKrzV50e07HEpBDnJaicyjrXqJV5v7Ue0PUSrzf2o9p2fIMi849RnmYnWPUSrzf2o9oPBKvNXnR7Ts+QZDnHqHMxOr+otXmrzo9oeotXmrzo9p2jIMi849X35jmkdYWCVeavOj2nM7B8GqK/sG4rJX9g366PArui3xnnZHLbDvx2x8dsus0jiqVHyJbHwNQpLlLafQ0DEafk57cAAAAAAAAAAA/Dd2ZbSngVaMVm/TFnxpcFePKegs8Aq81edHtPoPutvaWr/v2n08T0jme5xLNxwdr+5/LE89h8E6t9S4s6hLAKvNXnR7SfqBV5q86PaduqIkd+5ux16po6k8Bq81edHtJTwKrzV50e07bIlIxzjNc2jqUsAq81edHtJPAKvNXnR7Tt0xWTnGVU1rOnPAKvNXnR7Txq2D1Y8MG/i5S6ItvoO6E5GecZebR+fzX15CUju2IYZCp98t/ikvvl8vGu88zqOIWMqctMvklxSXauNcXypvkU7mZQcTxJEpFWSkaMIRHmYfad0nGHLvt8kVvt+TeXfaPDR2DYnS36kuTTFfLm380TMnZHJFXZ2KjTSySWSW8lyItFEolInzH1lqZSBGBWDBiRVFSSKoqMlIFIEoMrAqMFYDonFlUbQLRKQJQKwLIyUiykCSKo0QqisSMSsWaRkrErAjArEpGOAADIAAAAAAABy2w78dsfHbLrNI4k5bYd+O2Pjtl1mkcdToS2PgbjnW0+hiNMRp+VnsAAAAAAAAAAAD8a3W3tLV/37T6eJ6RzPdzda+01Xxi0+miekUme2xN1H+T+VHRYd1i2e7JzZIrMk2d7I+BE5EZFWTkYKSmKxpsSRk0iRORQnIhSckeBidgqkHHj4YvkkuD5HwPvM85kmynLa50F+Tt5CUjkcbpaas+/lLzkm/2szjpM+lO58NrMRHZNib9bP4y/dOtI7LsV+9n8ZfumJ9E5IZzn0URJFEzgR9RWJWJKJRAzIsiiZJFYMqMDwKxIxKoqMlosoRTKxKQtApBkYMqjkZksUiSRSDKgViUiyUWUTKjBaLKRZGLKRZoF0AkWOmDIAAAgAAAActsO/HbHx2y6zSOJOW2Hfjtj47ZdZpHHU6Etj4G451tPoYjTEaflZ7AAAAAAAAAAAA/Gt1r7TVfGLT6aJ6Qtnu7ut/aWr4xafTRPSFntsTdR/k+COiw7rFsXFiTZKQ8mTkzvJHwISTJMo2SZkpOQkxmJMhpCSJFJskzJpE2TZRslIHKdT2R/hX8WP8TiZHK7Ivwr8Ef4nEtn0xzI+F52JE7LsT+9n8ZfunWYs7LsUfrZ/GXzGZ5jcM5zyKokikGfOj6iqZRIlFlIMpHmLRZSDIwZSLKcZVFUyRSJTLKxZWDIwZSLKQtFlUQRWDORZjLLxYyZKDKZkWgFosoiEWUizRllosomRTHjI0iF0x1IgpDplBdMCakMpAzYYBdQagQY5bYd+O2Pjtl1mkcPqOX2Gy+3bHx2y6zSOOp0JbHwNxzo+hqNMRp+VnsAAAAAAAAAAAD8Y3XHtLV8YtPp4npDI93d117S1fGLT6aJ6PzPcYl+HfifBHRYd1i2e7FkTkxmTbO5Z8Ik2TkxpCTZllEJyZRkmyGhJk5DyZGbIaiLInMeTJTBs6nsif2V/Fj8zOJkctskf2V/Fj8xxMj6Y5j45Z2Sgzs2xT72fxl8x1iLOwbFa2/OPKlJf8c0/wB5eQzPomodJHZYjxZNMdHzI+otFlIMjFlEzQLIomRiViwcRZDRZODHNEZaLKJkYspFlMl4seLIxZRMqYLplIMhCRRM20ZLJlEyKY0WW4LxkOmRTGUgZZdSGTI5jJmrkLKQykRUzdRQWzDUTTDMApmctsNl9u2Pjtl1qkcI2cvsLl9vWPj1l1qkcdToS2PgajnR9FkaAH5WeuAAAAAAAAAAAPxfddP2Fq+MWn08T0dbPeHdee0tXxi0+miejjZ7bE7/APO/E+COjw3rFsXFmSZKTGkycmd0fAK2TkNJiEKhZsmxpMnNkNCNk2x5MlJkNpCtk2x5MmRmjqeyR/ZX8WHzHEs87Ga+qrN8Self8Uo/OmeAz6o5kfJLOzntsrAHaYniVq016Xv7yjFNZZ0oXFTuUsuSdLRNd6SOGsrpwlGS4nwcqaya+VHtJ6IRtUStsRpYvTj9gxCMLe4e/lC/t6eim5cSVxaU4xil/qtKrf38T1Tiz5MErKtRjLSsviWSS3+hyVYOnNrX6dnod/oV1JKS301mvryrgyLo6XhWLSpPli+GPf5Y8j+fpXarLEYVN+Ms+9wSXhXD8qzXfNSi0ckZXPNiUiRKZg2WgyiIIrFgzJFsyiZGLKRZUYKQZVMiUiymWWix4simUTKQsmVizx4sdM2mRnkJjxZCMh0VohZMdSIpjJhO4LJjqRBSGUiksW1G5kkwzBLFcwJ6g1FIUzOY2Fv7esfHrHrVI4PUcxsJf29YePWPWqRx1OhLY+BqOdffafR40APy09cAAAAAAAAAAAfiu699pKvjFp9PE9G5M9491+/YSr4xafTxPRmTPa4n+HfifBHR4b1nkuLMkybZrYkmd02fCLISTGJyYKK2TbGkyc2ZNJCyJyNkxAclhZHH4xiPc4N/6nvRXf5fBHh8i4zL/G4Q49UubHi+M99LpfeOqXl3KcnKT3+hLkXeNxjc45TtmPHZ2Da2wB3eJ4dapN+mL6zoyyWbVKdxT7rLLkhS1zfeizr7Z7U+h8bVMrnEauL1IvuGHxnb27eeU7+4p6aji+Bq2tKk4yTXDd0mn6ySWMLrKjRnN6Mm15F6+hijDlzjH7t2+h70bYu1/bYpZXFhdwc6FxDRLS0pwkmpU6tKTUlGrRqRjUhJxaUorNSWafyh25Npu8wK8dneR1Qlqla3UYuNC8oxa9fDfahWgnFVrdycqUmt+cJ0qlT7BHW9sDa7ssUtp2l/bwuKE2paZZqUJpNRq0qkXGpRqxUpJVKcoySlJZ5SafiMAw+WCys8sXnWh6Vr47mu+wjB1VWv7yP7yHxtTHR7UbavofOIW0pVMIqxxChwq2rzp299BcUVUlotLhJZt1JTtXwJQnvyfrzju1riVo2rrDr63ybTlVta8Kba4dNXR3GovhQnJd89vRwujWV4TWzM9zy+x0M6M4dJP235jiqWJVF/5J+c38+ZZYvV90l9fkOOiyiZ9VkcF3pOQji9X3SXR2Dxxar7pLo7Dj0x4sqS0C70nJLFqvukujsKLF6vPl0dhx0WOmWy0GLs5L1Xq+6S6OwpHGKvPl0dhxsZDplstAu9JySxWpz5dHYUji1Tny+vyHHRkOma5K0GbvScksWqc+XR2DrF6nPl0dhx0ZDplsiXek5BYtV58ujsHWMVefLo7Dj4yGLZaCXZyHqvV58ujsHWM1fdJdHYcapDqRbLQTlPScj6sVfdJdHYN6r1efLo7DjjVIWWgl3pOS9V6vukvr8hqxmp7pL6/Iccpm6xZEy6Wcj6sVfdJdHYHqxV58ug4/upvdC2Wgn6tJ5/qxV90l0D22yKvCcKkKs4zpzjUhJZZxnCSlGS3uGMkmvAcX3QNZLLQVOWln6E90Fjnvrd+dD+WY90Fjnvrd+dD+WfnmsxyOD8NR/bj/FfQ5Ocn35b39T9Clug8d99bvzofyxHug8d99bvzofyz8/bElIfh6X7cf4r6F52fflvZ+g/9QmO++1550P5Zj3Q2O++1351P+WfnrkYT8PR/bj/ABX0LztTvvez9BW6Ex332vPOh/LEe6Gx332vPOh/LPz6UhWyfh6P7cf4x+hedn3nvZ3DZBtyYtdUnRucRua9KTjJ06jg4uUHqi3lBPeaTOqyxarz5dHYeLKQjZuNOEVaMUtiSMucnlbfmzyni1Xny6OwlLF6vPl0dh40mTbLyVoKm9J5UsWq+6S6Owm8Xq8+XR2HiyYjZLLQW7PJeLVefLo7CcsXq8+XR2HjSkSbFloNJs8p4vV90l0dh41e9nLelOTXI28vIt4m2I2Zshdism2dlwHa2xK7aVrh19cJtJSpWtadNN8Guro7lBfCnOK757DbVXofWIXMo1MXrRw+hnm7ehKncX01nvxdSPdLS3TWTU4yuXwpwhvSXy1sLo0Vec1szvdn9jnp0Zz6MfvbmPwnac2m7zHbxWdmtMI6ZXd1KLlRtKEm/Xz4FOtNKSpW6kpVZJ78IQq1Kf1b2u9gFthdlb2FpBwoW8NEdTTnOTblUq1ZJRUqtapKVSclFJyk8lFZJbsA2u7LC7aFpYUIW9CDctMc3Kc2kpVatSTlUrVZKMU6lSUpNRis8opLsZ4jD8PlhUrLJFZlpfeevR2Lzbff4Pg6pK7z8NS1cT//2Q==`;