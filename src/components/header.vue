<template>
    <header>
        <div class="dark__newlxp_header_box">
            <div class="logo__box">
                <img src="../assets/media/DarkLxpLogo.svg" alt="">
            </div>
        </div>
    </header>
</template>

<script>
export default {
    name: 'Header',
    data() {
        return {};
    }
}
</script>

<style>
header {
    display: flex;
    position: fixed;
    top: 0px;
    width: 100%;
    height: 72px;
    background-color: #1e1e1e;
    padding: 12px 40px;
    z-index: 200;
    -webkit-box-pack: justify;
    justify-content: space-between;
    border-bottom: 1px solid #5670d0;
    box-shadow: 0px 0px 10px 0px #5670d0;
}
</style>