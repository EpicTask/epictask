<template>
    <div>
      <header>
        <h1>Epic Task</h1>
        <p>Empowering Children with Financial Responsibility</p>
      </header>

  
      <section>
        <div class="section-heading">
          <h2>What is Epic Task?</h2>
        </div>
        <v-row >
            <v-card>   <p>Epic Task is a web3 platform built using the XRP Ledger (XRPL) that allows parents to incentivize their children to complete tasks and earn XRP or "eTask" digital tokens, which can be exchanged for XRP or other currencies. The project is designed to help children learn money management skills and responsibility by incentivizing them to complete tasks.</p>
       </v-card>
       <v-card>   <p>Epic Task is a web3 platform built using the XRP Ledger (XRPL) that allows parents to incentivize their children to complete tasks and earn XRP or "eTask" digital tokens, which can be exchanged for XRP or other currencies. The project is designed to help children learn money management skills and responsibility by incentivizing them to complete tasks.</p>
       </v-card>
        </v-row>


     </section>
  
      <section class="how-it-works">
        <div class="section-heading">
          <h2>How it Works</h2>
        </div>
        <ol>
          <li>
            <p>Parents create a smart contract on the XRPL using their XRP wallet. The contract includes the parameters for the token, such as the number of tokens earned per task and rules for earning and exchanging tokens.</p>
          </li>
          <li>
            <p>Parent assigns tasks to the child through the XRP wallet, along with the number of tokens the child will earn for completing each task.</p>
          </li>
          <li>
            <p>Child completes the task and receives the specified number of tokens, which are transferred to their XRP wallet.</p>
          </li>
          <li>
            <p>The child can hold onto the tokens to accrue interest or exchange them for XRP or other currencies through the XRP wallet.</p>
          </li>
          <li>
            <p>Once the child has exchanged the tokens, the XRP or other currencies are transferred to their XRP wallet.</p>
          </li>
        </ol>
      </section>
  
      <section class="benefits">
        <div class="section-heading">
          <h2>Benefits</h2>
        </div>
        <ul>
          <li>
            <p>Financial Education: The token incentivizes children to learn money management skills, as they must manage their tokens and decide when to exchange them for XRP or other currencies.</p>
          </li>
          <li>
            <p>Customizable Parameters: The parent and child can customize the parameters of the smart contract to fit their needs and preferences.</p>
          </li>
          <li>
            <p>Low Fees: Transactions on the XRPL are fast and have low fees, making it an affordable way for parents and children to manage their tokens.</p>
          </li>
          <li>
            <p>Secure: The XRPL's consensus algorithm ensures that all transactions are secure and reliable.</p>
          </li>
        </ul>
      </section>
  
      <section class="cta-section">
        <h2>Start empowering your children with Epic Task today!</h2>
        <button class="cta-button">Get Started</button>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    // Add any component specific data or methods here
  }
  </script>
  
  <style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }
  
  header {
    background-color: #0a0909;
    padding: 20px;
    text-align: center;
  }
  
  h1 {
    font-size: 36px;
    margin-bottom: 10px;
  }
  
  h2 {
    font-size: 24px;
    color: #555;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 16px;
    color: #777;
    margin-bottom: 20px;
  }
  
  .section {
    padding: 40px 20px;
    background-color: #0000CD;
  }
  
  .section-heading {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .section-heading h2 {
    font-size: 28px;
    color: #333;
  }
  
  .feature {
    display: flex;
    margin-bottom: 30px;
  }
  
  .feature-icon {
    flex: 0 0 20%;
  }
  
  .feature-content {
    flex: 0 0 80%;
  }
  
  .feature-content h3 {
    font-size: 20px;
    color: #333;
    margin-bottom: 10px;
  }
  
  .feature-content p {
    font-size: 16px;
    color: #777;
  }
  
  .how-it-works {
    background-color: #f2f2f2;
    padding: 40px 20px;
  }
  
  .how-it-works h2 {
    color: #333;
    margin-bottom: 30px;
  }
  
  .how-it-works ol {
    margin-left: 30px;
  }
  
  .how-it-works li {
    font-size: 16px;
    color: #555;
    margin-bottom: 10px;
  }
  
  .benefits {
    padding: 40px 20px;
    background-color: #fff;
  }
  
  .benefits h2 {
    color: #333;
    margin-bottom: 30px;
  }
  
  .benefits ul {
    margin-left: 30px;
  }
  
  .benefits li {
    font-size: 16px;
    color: #555;
    margin-bottom: 10px;
  }
  
  .cta-section {
    background-color: #f2f2f2;
    padding: 40px 20px;
    text-align: center;
  }
  
  .cta-section h2 {
    color: #333;
    margin-bottom: 20px;
  }
  

  </style>